import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: 'Authorization token is required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as jwt.JwtPayload;
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token.' });
  }
};
