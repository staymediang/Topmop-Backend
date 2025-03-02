import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend the request object to include the user property
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: "user" | "admin" | "super admin" | "booking_manager";
    };
  }
}

// Middleware to verify token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: string;
      role: string;
    };

    // Normalize role to lowercase for consistency
    req.user = {
      userId: decoded.userId,
      role: decoded.role.trim().toLowerCase() as "user" | "admin" | "super admin" | "booking_manager",
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !["admin", "super admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access restricted to admin only" });
  }
  next();
};

// Middleware to check if user is a super admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "super admin") {
    return res.status(403).json({ message: "Access restricted to super admin only" });
  }
  next();
};

// Middleware to check if user is a booking manager or super admin
export const isBookingManager = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !["booking_manager", "super admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access restricted to booking manager or super admin only" });
  }
  next();
};
