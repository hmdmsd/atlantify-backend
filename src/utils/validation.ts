import { body, param } from 'express-validator';

export const validateSuggestion = [
  body('title').isString().withMessage('Title must be a string.'),
  body('artist').isString().withMessage('Artist must be a string.'),
];

export const validateIdParam = [
  param('id').isUUID().withMessage('ID must be a valid UUID.'),
];
