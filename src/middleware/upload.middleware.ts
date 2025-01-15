import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create the "uploads" directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increase to 10MB to support larger MP3 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', // Standard MP3
      'audio/mp3', // Some browsers/systems
      'audio/x-mp3', // Alternative MP3 mime type
      'audio/ogg',
      'audio/wav',
    ];

    const allowedExtensions = ['.mp3', '.ogg', '.wav'];

    // Check both MIME type and file extension
    const isAllowedType = allowedTypes.includes(file.mimetype);
    const isAllowedExtension = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase()
    );

    if (isAllowedType || isAllowedExtension) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only MP3, OGG, and WAV files are allowed.'
        )
      );
    }
  },
});

// Custom interface to extend Request with uploaded file
export interface UploadedRequest extends Request {
  file: Express.Multer.File;
}

// Middleware to validate file upload
export const validateFileUpload = (
  req: UploadedRequest,
  res: any,
  next: any
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const { title, artist } = req.body;
  if (!title || !artist) {
    // If file was uploaded but metadata is missing, delete the file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      success: false,
      message: 'Title and artist are required',
    });
  }

  next();
};
