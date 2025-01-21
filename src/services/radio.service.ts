import { EventEmitter } from 'events';
import { Op } from 'sequelize';
import { QueueModel } from '../models/queue.model';
import { SongModel } from '../models/song.model';
import { UserModel } from '../models/user.model';
import { WebSocket } from 'ws';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  addedBy: {
    id: string;
    username: string;
  };
  addedAt: string;
}

interface QueueState {
  currentTrack: Track | null;
  queue: Track[];
  listeners: number;
  isRadioActive: boolean;
}

interface QueueUpdateEvent {
  type:
    | 'QUEUE_UPDATE'
    | 'TRACK_CHANGE'
    | 'LISTENERS_UPDATE'
    | 'RADIO_STATUS_CHANGE';
  data: Partial<QueueState>;
}

class RadioService extends EventEmitter {
  private static instance: RadioService;
  private queueState: QueueState = {
    currentTrack: null,
    queue: [],
    listeners: 0,
    isRadioActive: false,
  };
  private wsClients: Set<WebSocket> = new Set();
  private trackPlaybackTimer: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.initializeQueue = this.initializeQueue.bind(this);
    this.broadcastUpdate = this.broadcastUpdate.bind(this);
    this.startRadioPlayback = this.startRadioPlayback.bind(this);
    this.stopRadioPlayback = this.stopRadioPlayback.bind(this);
    this.advanceToNextTrack = this.advanceToNextTrack.bind(this);
  }

  public static getInstance(): RadioService {
    if (!RadioService.instance) {
      RadioService.instance = new RadioService();
    }
    return RadioService.instance;
  }

  private generateTrackUrl(song: SongModel): string {
    return song.publicUrl || song.path;
  }

  // Broadcast update method
  private broadcastUpdate(update: QueueUpdateEvent): void {
    const message = JSON.stringify(update);
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private async initializeQueue() {
    try {
      const queueItems = await QueueModel.findAll({
        order: [['position', 'ASC']],
        include: [
          {
            model: SongModel,
            as: 'queueSong',
            attributes: [
              'id',
              'title',
              'artist',
              'path',
              'publicUrl',
              'duration',
            ],
          },
          {
            model: UserModel,
            as: 'addedByUser',
            attributes: ['id', 'username'],
          },
        ],
      });

      // Transform queue items into Track format
      this.queueState.queue = queueItems.map((item) => ({
        id: item.id,
        title: item.queueSong.title,
        artist: item.queueSong.artist,
        url: this.generateTrackUrl(item.queueSong),
        duration: item.queueSong.duration,
        addedBy: {
          id: item.addedByUser.id,
          username: item.addedByUser.username,
        },
        addedAt: item.createdAt.toISOString(),
      }));

      // Set current track if queue is not empty
      if (this.queueState.queue.length > 0) {
        this.queueState.currentTrack = this.queueState.queue[0];
      }
    } catch (error) {
      console.error('Failed to initialize queue:', error);
    }
  }

  private startRadioPlayback() {
    // Stop any existing playback timer
    this.stopRadioPlayback();

    // Ensure we have tracks and radio is active
    if (this.queueState.queue.length === 0 || !this.queueState.isRadioActive) {
      return;
    }

    // If no current track, start from the first track
    if (!this.queueState.currentTrack) {
      this.queueState.currentTrack = this.queueState.queue[0];
    }

    // Start playback timer for the current track's full duration
    if (this.queueState.currentTrack) {
      this.trackPlaybackTimer = setTimeout(
        this.advanceToNextTrack,
        this.queueState.currentTrack.duration * 1000
      );

      // Broadcast track change
      this.broadcastUpdate({
        type: 'TRACK_CHANGE',
        data: {
          currentTrack: this.queueState.currentTrack,
          queue: this.queueState.queue,
        },
      });
    }
  }

  private stopRadioPlayback() {
    if (this.trackPlaybackTimer) {
      clearTimeout(this.trackPlaybackTimer);
      this.trackPlaybackTimer = null;
    }
  }

  private advanceToNextTrack() {
    // Ensure we have tracks in the queue
    if (this.queueState.queue.length === 0) {
      this.queueState.currentTrack = null;
      return;
    }

    // Remove the first track from the queue
    this.queueState.queue.shift();

    // If queue is empty after removal, reset current track
    if (this.queueState.queue.length === 0) {
      this.queueState.currentTrack = null;
      this.stopRadioPlayback();
      return;
    }

    // Set the next track as current
    this.queueState.currentTrack = this.queueState.queue[0];

    // Restart playback for the new track
    this.startRadioPlayback();
  }

  public async toggleRadioStatus(userId: string): Promise<boolean> {
    // Verify user is admin
    const user = await UserModel.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admin can toggle radio status');
    }

    // Toggle radio status
    this.queueState.isRadioActive = !this.queueState.isRadioActive;

    if (this.queueState.isRadioActive) {
      this.startRadioPlayback();
    } else {
      this.stopRadioPlayback();
    }

    // Broadcast radio status change
    this.broadcastUpdate({
      type: 'RADIO_STATUS_CHANGE',
      data: {
        isRadioActive: this.queueState.isRadioActive,
        currentTrack: this.queueState.currentTrack,
      },
    });

    return this.queueState.isRadioActive;
  }
  public async addToQueue(songId: string, userId: string): Promise<QueueModel> {
    // Verify user is admin
    const user = await UserModel.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admin can add tracks to the queue');
    }

    const song = await SongModel.findByPk(songId);
    if (!song) {
      throw new Error('Song not found');
    }

    // Calculate next position
    const lastPosition = (await QueueModel.max('position')) || 0;

    const queueItem = await QueueModel.create({
      songId,
      addedBy: userId,
      position: lastPosition + 1,
    });

    // Fetch the full queue item with associations
    const fullQueueItem = await QueueModel.findByPk(queueItem.id, {
      include: [
        {
          model: SongModel,
          as: 'queueSong',
          attributes: [
            'id',
            'title',
            'artist',
            'path',
            'publicUrl',
            'duration',
          ],
        },
        {
          model: UserModel,
          as: 'addedByUser',
          attributes: ['id', 'username'],
        },
      ],
    });

    // Transform to Track format
    const newTrack = {
      id: fullQueueItem.id,
      title: fullQueueItem.queueSong.title,
      artist: fullQueueItem.queueSong.artist,
      url: this.generateTrackUrl(fullQueueItem.queueSong),
      duration: fullQueueItem.queueSong.duration,
      addedBy: {
        id: fullQueueItem.addedByUser.id,
        username: fullQueueItem.addedByUser.username,
      },
      addedAt: fullQueueItem.createdAt.toISOString(),
    };

    // Update local queue state
    this.queueState.queue.push(newTrack);

    // Broadcast update
    this.broadcastUpdate({
      type: 'QUEUE_UPDATE',
      data: { queue: this.queueState.queue },
    });

    return queueItem;
  }

  public async removeFromQueue(
    queueId: string,
    userId: string
  ): Promise<boolean> {
    // Verify user is admin
    const user = await UserModel.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admin can remove tracks from the queue');
    }

    const queueItem = await QueueModel.findByPk(queueId);
    if (!queueItem) return false;

    await queueItem.destroy();

    // Remove from local queue state
    this.queueState.queue = this.queueState.queue.filter(
      (item) => item.id !== queueId
    );

    // Reorder remaining queue items
    this.queueState.queue.forEach((item, index) => {
      // In a real-world scenario, you'd update the database position here
    });

    // Broadcast update
    this.broadcastUpdate({
      type: 'QUEUE_UPDATE',
      data: { queue: this.queueState.queue },
    });

    return true;
  }

  public async skipCurrentTrack(userId: string): Promise<void> {
    // Verify user is admin
    const user = await UserModel.findByPk(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Only admin can skip tracks');
    }

    if (this.queueState.queue.length === 0) {
      throw new Error('No tracks in queue');
    }

    // Remove current track from database and queue
    if (this.queueState.currentTrack) {
      await QueueModel.destroy({
        where: { id: this.queueState.currentTrack.id },
      });
    }

    // Remove from local queue
    this.queueState.queue.shift();

    // Set next track as current
    this.queueState.currentTrack = this.queueState.queue[0] || null;

    // Broadcast track change
    this.broadcastUpdate({
      type: 'TRACK_CHANGE',
      data: {
        currentTrack: this.queueState.currentTrack,
        queue: this.queueState.queue,
      },
    });
  }

  public getCurrentQueue(): QueueState {
    return { ...this.queueState };
  }

  // Method to add WebSocket clients
  public addWebSocketClient(ws: WebSocket) {
    this.wsClients.add(ws);

    // Increment listeners
    this.queueState.listeners++;

    // Broadcast listeners update
    this.broadcastUpdate({
      type: 'LISTENERS_UPDATE',
      data: { listeners: this.queueState.listeners },
    });

    // Remove client on close
    ws.on('close', () => {
      this.wsClients.delete(ws);

      // Decrement listeners
      this.queueState.listeners--;

      // Broadcast listeners update
      this.broadcastUpdate({
        type: 'LISTENERS_UPDATE',
        data: { listeners: this.queueState.listeners },
      });
    });
  }
}

export const radioService = RadioService.getInstance();
