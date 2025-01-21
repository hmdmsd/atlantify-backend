import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if user exists and is an admin
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No user found',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required',
    });
  }

  next();
};
