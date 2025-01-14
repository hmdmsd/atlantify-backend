import { SongModel } from '../models/song.model';
import { S3Service } from './s3.service';

const s3Service = new S3Service();

export class SongsService {
  /**
   * Retrieves all songs.
   */
  async listSongs(): Promise<SongModel[]> {
    return SongModel.findAll();
  }

  /**
   * Uploads a song to S3 and stores metadata in the database.
   * @param title - Title of the song.
   * @param artist - Artist of the song.
   * @param filePath - Local path to the song file.
   * @param size - Size of the song file.
   * @param uploadedBy - ID of the user uploading the song.
   * @returns The uploaded song metadata.
   */
  async uploadSong({
    title,
    artist,
    filePath,
    size,
    uploadedBy,
  }: {
    title: string;
    artist: string;
    filePath: string;
    size: number;
    uploadedBy: string;
  }): Promise<SongModel> {
    const s3Url = await s3Service.uploadFile(filePath, `songs/${title}`);
    return SongModel.create({ title, artist, path: s3Url, size, uploadedBy });
  }

  /**
   * Retrieves song metadata by ID.
   * @param songId - The ID of the song.
   * @returns The song metadata or null if not found.
   */
  async getSongDetails(songId: string): Promise<SongModel | null> {
    return SongModel.findByPk(songId);
  }

  /**
   * Deletes a song from S3 and removes its metadata from the database.
   * @param songId - The ID of the song.
   * @returns True if the song was deleted, false otherwise.
   */
  async deleteSong(songId: string): Promise<boolean> {
    const song = await SongModel.findByPk(songId);
    if (!song) return false;

    await s3Service.deleteFile(song.path);
    await song.destroy();
    return true;
  }
}
