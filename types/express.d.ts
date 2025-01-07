// src/types/express.d.ts
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      user?: JwtPayload & { userId: string; role: "user" | "admin" | "super admin" | "booking_manager" };
    }
  }
}


export {};
