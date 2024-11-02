// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File; // Use Multer.File directly here
      user?: JwtPayload & { userId: string; role: "user" | "admin" | "super admin" };
    }
  }
}

export {};