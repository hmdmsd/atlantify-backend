import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request extends Request {
    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
  }
}
