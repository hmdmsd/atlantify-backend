import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

interface JwtUserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader); // Debug log

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'Authorization token is required.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Debug log

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtUserPayload;
      console.log('Decoded token:', decoded); // Debug log

      // Set user info in request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt,
      };

      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error.' });
  }
};
