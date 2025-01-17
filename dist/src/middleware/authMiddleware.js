"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBookingManager = exports.isSuperAdmin = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Access denied" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.user?.role?.toLowerCase() !== "admin".toLowerCase() && req.user?.role !== "super admin".toLowerCase()) {
        return res.status(403).json({ message: "Access restricted to admin only" });
    }
    next();
};
exports.isAdmin = isAdmin;
// Middleware to check if user is a super admin
const isSuperAdmin = (req, res, next) => {
    if (req.user?.role.toLowerCase() !== "super admin".toLowerCase()) {
        return res.status(403).json({ message: "Access restricted to super admin only" });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
// Middleware to check if user is a booking manager
const isBookingManager = (req, res, next) => {
    if (req.user?.role.toLowerCase() !== "booking_manager".toLowerCase() && req.user?.role !== "super admin".toLowerCase()) {
        return res.status(403).json({ message: "Access restricted to booking manager or super admin only" });
    }
    next();
};
exports.isBookingManager = isBookingManager;
