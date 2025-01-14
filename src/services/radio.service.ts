import { QueueModel } from '../models/queue.model';
import { SongModel } from '../models/song.model';

export class RadioService {
  /**
   * Retrieves the current radio queue sorted by position.
   */
  async getQueue(): Promise<QueueModel[]> {
    return QueueModel.findAll({ order: [['position', 'ASC']] });
  }

  /**
   * Adds a song to the radio queue.
   * @param songId - The ID of the song to add.
   * @param userId - The ID of the user adding the song.
   * @returns The newly added queue item.
   */
  async addToQueue(songId: string, userId: string): Promise<QueueModel> {
    const position = (await QueueModel.count()) + 1;
    return QueueModel.create({ songId, addedBy: userId, position });
  }

  /**
   * Removes a song from the queue by its ID.
   * @param queueId - The ID of the queue item to remove.
   * @returns True if the item was removed, false otherwise.
   */
  async removeFromQueue(queueId: string): Promise<boolean> {
    const queueItem = await QueueModel.findByPk(queueId);
    if (!queueItem) return false;

    await queueItem.destroy();
    return true;
  }

  /**
   * Retrieves the current song playing on the radio (position 1 in queue).
   */
  async getCurrent(): Promise<SongModel | null> {
    const current = await QueueModel.findOne({
      where: { position: 1 },
      include: SongModel,
    });
    return current ? current.getDataValue('Song') : null;
  }

  /**
   * Retrieves the next song in the queue (position 2 in queue).
   */
  async getNext(): Promise<SongModel | null> {
    const next = await QueueModel.findOne({
      where: { position: 2 },
      include: SongModel,
    });
    return next ? next.getDataValue('Song') : null;
  }
}
