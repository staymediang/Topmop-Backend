import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Middleware to verify token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: string; // Change this to string
      role: "user" | "admin" | "super admin" | "booking_manager";
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin" && req.user?.role !== "super admin") {
    return res.status(403).json({ message: "Access restricted to admin only" });
  }
  next();
};

// Middleware to check if user is a super admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "super admin") {
    return res.status(403).json({ message: "Access restricted to super admin only" });
  }
  next();
};

// Middleware to check if user is a booking manager
export const isBookingManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "booking_manager" && req.user?.role !== "super admin") {
    return res.status(403).json({ message: "Access restricted to booking manager or super admin only" });
  }
  next();
};
