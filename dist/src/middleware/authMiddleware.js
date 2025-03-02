"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBookingManager = exports.isSuperAdmin = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Normalize role to lowercase for consistency
        req.user = {
            userId: decoded.userId,
            role: decoded.role.trim().toLowerCase(),
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.verifyToken = verifyToken;
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user || !["admin", "super admin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access restricted to admin only" });
    }
    next();
};
exports.isAdmin = isAdmin;
// Middleware to check if user is a super admin
const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "super admin") {
        return res.status(403).json({ message: "Access restricted to super admin only" });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
// Middleware to check if user is a booking manager or super admin
const isBookingManager = (req, res, next) => {
    if (!req.user) {
        console.log("❌ No user in request. Possible missing `verifyToken` middleware.");
        return res.status(401).json({ message: "Unauthorized, please log in" });
    }
    const userRole = req.user.role?.trim().toLowerCase(); // Normalize role
    console.log("🟢 User Role in Middleware:", userRole);
    if (userRole !== "booking_manager" && userRole !== "super admin") {
        console.log("❌ Access Denied for role:", userRole);
        return res.status(403).json({ message: "Access restricted to booking manager or super admin only" });
    }
    next();
};
exports.isBookingManager = isBookingManager;
