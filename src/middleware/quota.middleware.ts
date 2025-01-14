import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { SongModel } from '../models/song.model';

const MAX_STORAGE_LIMIT_MB = 500; // Define storage limit per user in MB

export const quotaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.sub as string; // User ID from auth middleware

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: 'User not authenticated.' });
      return;
    }

    // Calculate user's current storage usage
    const userSongs = await SongModel.findAll({
      where: { uploadedBy: userId },
    });
    const totalSizeMB =
      userSongs.reduce((sum, song) => sum + song.size, 0) / (1024 * 1024);

    if (totalSizeMB >= MAX_STORAGE_LIMIT_MB) {
      res.status(403).json({
        success: false,
        message: `Storage limit exceeded. Maximum allowed is ${MAX_STORAGE_LIMIT_MB} MB.`,
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
