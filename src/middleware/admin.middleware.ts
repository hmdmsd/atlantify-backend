import { Request, Response, NextFunction } from 'express';

// Make sure this interface matches your JwtUserPayload from auth middleware
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Extend Express Request type to include user property if not already declared
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user exists and is an admin
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: No user found',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required',
    });
    return;
  }

  next();
};
