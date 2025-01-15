import { EventEmitter } from 'events';
import { QueueModel } from '../models/queue.model';
import { SongModel } from '../models/song.model';
import { WebSocket } from 'ws';

interface QueueState {
  currentTrack: any | null;
  queue: any[];
  listeners: number;
}

interface QueueUpdateEvent {
  type: 'QUEUE_UPDATE' | 'TRACK_CHANGE' | 'LISTENERS_UPDATE';
  data: Partial<QueueState>;
}

class RadioService extends EventEmitter {
  private static instance: RadioService;
  private queueState: QueueState = {
    currentTrack: null,
    queue: [],
    listeners: 0,
  };
  private wsClients: Set<WebSocket> = new Set();

  private constructor() {
    super();
    this.initializeQueue();
  }

  public static getInstance(): RadioService {
    if (!RadioService.instance) {
      RadioService.instance = new RadioService();
    }
    return RadioService.instance;
  }

  private async initializeQueue() {
    try {
      const queue = await QueueModel.findAll({
        order: [['position', 'ASC']],
        include: [
          {
            model: SongModel,
            attributes: ['id', 'title', 'artist', 'path', 'duration'],
          },
        ],
      });

      this.queueState.queue = queue.map((q) => ({
        id: q.id,
        song: q.song,
        addedBy: q.addedBy,
        position: q.position,
      }));

      if (this.queueState.queue.length > 0) {
        this.queueState.currentTrack = this.queueState.queue[0];
      }
    } catch (error) {
      console.error('Failed to initialize queue:', error);
    }
  }

  public addWebSocketClient(ws: WebSocket) {
    this.wsClients.add(ws);
    this.queueState.listeners++;
    this.broadcastUpdate({
      type: 'LISTENERS_UPDATE',
      data: { listeners: this.queueState.listeners },
    });

    ws.on('close', () => {
      this.wsClients.delete(ws);
      this.queueState.listeners--;
      this.broadcastUpdate({
        type: 'LISTENERS_UPDATE',
        data: { listeners: this.queueState.listeners },
      });
    });
  }

  private broadcastUpdate(update: QueueUpdateEvent) {
    const message = JSON.stringify(update);
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public async addToQueue(songId: string, userId: string): Promise<QueueModel> {
    const song = await SongModel.findByPk(songId, {
      attributes: ['id', 'title', 'artist', 'path', 'duration'],
    });

    if (!song) {
      throw new Error('Song not found');
    }

    const position = this.queueState.queue.length + 1;
    const queueItem = await QueueModel.create({
      songId,
      addedBy: userId,
      position,
    });

    const queueWithSong = await QueueModel.findByPk(queueItem.id, {
      include: [
        {
          model: SongModel,
          attributes: ['id', 'title', 'artist', 'path', 'duration'],
        },
      ],
    });

    const formattedQueueItem = {
      id: queueWithSong.id,
      song: queueWithSong.song,
      addedBy: queueWithSong.addedBy,
      position: queueWithSong.position,
    };

    this.queueState.queue.push(formattedQueueItem);

    this.broadcastUpdate({
      type: 'QUEUE_UPDATE',
      data: { queue: this.queueState.queue },
    });

    return queueItem;
  }

  public async removeFromQueue(queueId: string): Promise<boolean> {
    const queueItem = await QueueModel.findByPk(queueId);
    if (!queueItem) return false;

    await queueItem.destroy();
    this.queueState.queue = this.queueState.queue.filter(
      (item) => item.id !== queueId
    );

    // Reorder remaining queue items
    this.queueState.queue.forEach((item, index) => {
      item.position = index + 1;
    });

    this.broadcastUpdate({
      type: 'QUEUE_UPDATE',
      data: { queue: this.queueState.queue },
    });

    return true;
  }

  public async skipCurrentTrack(): Promise<void> {
    if (this.queueState.queue.length === 0) {
      throw new Error('No tracks in queue');
    }

    // Remove current track
    await this.removeFromQueue(this.queueState.currentTrack.id);

    // Set next track as current
    this.queueState.currentTrack = this.queueState.queue[0] || null;

    this.broadcastUpdate({
      type: 'TRACK_CHANGE',
      data: { currentTrack: this.queueState.currentTrack },
    });
  }

  public getCurrentQueue(): QueueState {
    return {
      currentTrack: this.queueState.currentTrack,
      queue: this.queueState.queue,
      listeners: this.queueState.listeners,
    };
  }
}

export const radioService = RadioService.getInstance();
