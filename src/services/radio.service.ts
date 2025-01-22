import { EventEmitter } from 'events';
import { QueueModel } from '../models/queue.model';
import { SongModel } from '../models/song.model';
import { UserModel } from '../models/user.model';
import { WebSocket } from 'ws';
import { S3Service } from './s3.service';
import logger from '../utils/logger';

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
  private s3Service: S3Service;
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
    this.s3Service = new S3Service();
    this.initializeQueue = this.initializeQueue.bind(this);
    this.broadcastUpdate = this.broadcastUpdate.bind(this);
    this.startRadioPlayback = this.startRadioPlayback.bind(this);
    this.stopRadioPlayback = this.stopRadioPlayback.bind(this);
    this.advanceToNextTrack = this.advanceToNextTrack.bind(this);

    this.initializeQueue().catch((error) => {
      logger.error('Failed to initialize queue:', error);
    });
  }

  public static getInstance(): RadioService {
    if (!RadioService.instance) {
      RadioService.instance = new RadioService();
    }
    return RadioService.instance;
  }

  private async generateSignedUrl(song: SongModel): Promise<string> {
    try {
      return await this.s3Service.getSignedUrl(song.path);
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  private async transformQueueItem(
    queueItem: QueueModel & {
      queueSong: SongModel;
      addedByUser: UserModel;
    }
  ): Promise<Track> {
    try {
      const signedUrl = await this.generateSignedUrl(queueItem.queueSong);

      return {
        id: queueItem.id,
        title: queueItem.queueSong.title,
        artist: queueItem.queueSong.artist,
        url: signedUrl,
        duration: queueItem.queueSong.duration,
        addedBy: {
          id: queueItem.addedByUser.id,
          username: queueItem.addedByUser.username,
        },
        addedAt: queueItem.createdAt.toISOString(),
      };
    } catch (error) {
      logger.error('Error transforming queue item:', error);
      throw error;
    }
  }

  private broadcastUpdate(update: QueueUpdateEvent): void {
    const message = JSON.stringify(update);
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          logger.error('Error broadcasting to client:', error);
          this.wsClients.delete(client);
        }
      }
    });
  }

  private async refreshTrackUrls(): Promise<void> {
    try {
      const updatedQueue = await Promise.all(
        this.queueState.queue.map(async (track) => {
          const queueItem = await QueueModel.findByPk(track.id, {
            include: [
              {
                model: SongModel,
                as: 'queueSong',
                required: true,
              },
              {
                model: UserModel,
                as: 'addedByUser',
                required: true,
              },
            ],
          });
          return queueItem
            ? await this.transformQueueItem(
                queueItem as QueueModel & {
                  queueSong: SongModel;
                  addedByUser: UserModel;
                }
              )
            : track;
        })
      );

      this.queueState.queue = updatedQueue;

      if (this.queueState.currentTrack) {
        const currentQueueItem = await QueueModel.findByPk(
          this.queueState.currentTrack.id,
          {
            include: [
              {
                model: SongModel,
                as: 'queueSong',
                required: true,
              },
              {
                model: UserModel,
                as: 'addedByUser',
                required: true,
              },
            ],
          }
        );

        if (currentQueueItem) {
          this.queueState.currentTrack = await this.transformQueueItem(
            currentQueueItem as QueueModel & {
              queueSong: SongModel;
              addedByUser: UserModel;
            }
          );
        }
      }
    } catch (error) {
      logger.error('Error refreshing track URLs:', error);
      throw error;
    }
  }

  private async initializeQueue() {
    try {
      const queueItems = await QueueModel.findAll({
        order: [['position', 'ASC']],
        include: [
          {
            model: SongModel,
            as: 'queueSong',
            required: true,
            attributes: ['id', 'title', 'artist', 'path', 'duration'],
          },
          {
            model: UserModel,
            as: 'addedByUser',
            required: true,
            attributes: ['id', 'username'],
          },
        ],
      });

      this.queueState.queue = await Promise.all(
        queueItems.map((item) =>
          this.transformQueueItem(
            item as QueueModel & {
              queueSong: SongModel;
              addedByUser: UserModel;
            }
          )
        )
      );

      if (this.queueState.queue.length > 0) {
        this.queueState.currentTrack = this.queueState.queue[0];
      }

      if (this.queueState.isRadioActive) {
        this.startRadioPlayback();
      }
    } catch (error) {
      logger.error('Failed to initialize queue:', error);
      throw error;
    }
  }

  private startRadioPlayback() {
    this.stopRadioPlayback();

    if (this.queueState.queue.length === 0 || !this.queueState.isRadioActive) {
      return;
    }

    if (!this.queueState.currentTrack) {
      this.queueState.currentTrack = this.queueState.queue[0];
    }

    if (this.queueState.currentTrack) {
      // Set timer for track duration
      this.trackPlaybackTimer = setTimeout(
        this.advanceToNextTrack,
        this.queueState.currentTrack.duration * 1000
      );

      // Refresh URLs every 50 minutes (before the 1-hour expiration)
      setInterval(
        async () => {
          try {
            await this.refreshTrackUrls();
            this.broadcastUpdate({
              type: 'QUEUE_UPDATE',
              data: {
                currentTrack: this.queueState.currentTrack,
                queue: this.queueState.queue,
              },
            });
          } catch (error) {
            logger.error('Error refreshing URLs:', error);
          }
        },
        50 * 60 * 1000
      );

      // Broadcast current track
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

  private async advanceToNextTrack() {
    try {
      if (this.queueState.queue.length === 0) {
        this.queueState.currentTrack = null;
        return;
      }

      // Remove current track from queue and database
      if (this.queueState.currentTrack) {
        await QueueModel.destroy({
          where: { id: this.queueState.currentTrack.id },
        });
      }

      this.queueState.queue.shift();

      if (this.queueState.queue.length === 0) {
        this.queueState.currentTrack = null;
        this.stopRadioPlayback();
        return;
      }

      // Update track URLs and start playback
      await this.refreshTrackUrls();
      this.queueState.currentTrack = this.queueState.queue[0];
      this.startRadioPlayback();

      // Broadcast updates
      this.broadcastUpdate({
        type: 'TRACK_CHANGE',
        data: {
          currentTrack: this.queueState.currentTrack,
          queue: this.queueState.queue,
        },
      });
    } catch (error) {
      logger.error('Error advancing to next track:', error);
      throw error;
    }
  }

  public async toggleRadioStatus(userId: string): Promise<boolean> {
    try {
      const user = await UserModel.findByPk(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Only admin can toggle radio status');
      }

      this.queueState.isRadioActive = !this.queueState.isRadioActive;

      if (this.queueState.isRadioActive) {
        await this.refreshTrackUrls();
        this.startRadioPlayback();
      } else {
        this.stopRadioPlayback();
      }

      this.broadcastUpdate({
        type: 'RADIO_STATUS_CHANGE',
        data: {
          isRadioActive: this.queueState.isRadioActive,
          currentTrack: this.queueState.currentTrack,
        },
      });

      return this.queueState.isRadioActive;
    } catch (error) {
      logger.error('Error toggling radio status:', error);
      throw error;
    }
  }

  public async addToQueue(songId: string, userId: string): Promise<QueueModel> {
    try {
      const user = await UserModel.findByPk(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Only admin can add tracks to the queue');
      }

      const song = await SongModel.findByPk(songId);
      if (!song) {
        throw new Error('Song not found');
      }

      const lastPosition = (await QueueModel.max('position')) as number;
      const newPosition = (lastPosition || 0) + 1;

      const queueItem = await QueueModel.create({
        songId,
        addedBy: userId,
        position: newPosition,
      });

      const fullQueueItem = await QueueModel.findByPk(queueItem.id, {
        include: [
          {
            model: SongModel,
            as: 'queueSong',
            required: true,
          },
          {
            model: UserModel,
            as: 'addedByUser',
            required: true,
          },
        ],
      });

      if (!fullQueueItem) {
        throw new Error('Failed to create queue item');
      }

      const newTrack = await this.transformQueueItem(
        fullQueueItem as QueueModel & {
          queueSong: SongModel;
          addedByUser: UserModel;
        }
      );

      this.queueState.queue.push(newTrack);

      this.broadcastUpdate({
        type: 'QUEUE_UPDATE',
        data: { queue: this.queueState.queue },
      });

      return queueItem;
    } catch (error) {
      logger.error('Error adding to queue:', error);
      throw error;
    }
  }
  public async removeFromQueue(
    queueId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const user = await UserModel.findByPk(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Only admin can remove tracks from the queue');
      }

      const queueItem = await QueueModel.findByPk(queueId);
      if (!queueItem) return false;

      await queueItem.destroy();

      this.queueState.queue = this.queueState.queue.filter(
        (item) => item.id !== queueId
      );

      this.broadcastUpdate({
        type: 'QUEUE_UPDATE',
        data: { queue: this.queueState.queue },
      });

      return true;
    } catch (error) {
      logger.error('Error removing from queue:', error);
      throw error;
    }
  }

  public async skipCurrentTrack(userId: string): Promise<void> {
    try {
      const user = await UserModel.findByPk(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Only admin can skip tracks');
      }

      if (this.queueState.queue.length === 0) {
        throw new Error('No tracks in queue');
      }

      // Stop current playback
      this.stopRadioPlayback();
      await this.advanceToNextTrack();
    } catch (error) {
      logger.error('Error skipping track:', error);
      throw error;
    }
  }

  public getCurrentQueue(): QueueState {
    return { ...this.queueState };
  }

  public addWebSocketClient(ws: WebSocket) {
    this.wsClients.add(ws);
    this.queueState.listeners++;

    // Send initial state to new client
    try {
      ws.send(
        JSON.stringify({
          type: 'QUEUE_UPDATE',
          data: this.queueState,
        })
      );
    } catch (error) {
      logger.error('Error sending initial state to client:', error);
    }

    // Broadcast listeners update
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
}

export const radioService = RadioService.getInstance();
