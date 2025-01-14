import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = 'Success'
): void => {
  res.status(200).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  error: any,
  statusCode: number = 500
): void => {
  const message = error.message || 'Internal server error.';
  res.status(statusCode).json({ success: false, message });
};
