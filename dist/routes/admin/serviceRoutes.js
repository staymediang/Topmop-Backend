"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceControllers_1 = require("../../controllers/serviceControllers");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.post("/services", authMiddleware_1.isAdmin, uploadMiddleware_1.default.single("image"), serviceControllers_1.createService); // Admin-only route with image upload
router.get("/services", serviceControllers_1.getAllServices); // Public route for viewing services
router.patch("/services/:id", authMiddleware_1.isAdmin, uploadMiddleware_1.default.single("image"), serviceControllers_1.updateService); // Admin-only route with image upload
router.delete("/services/:id", authMiddleware_1.isAdmin, serviceControllers_1.deleteService); // Admin-only route
exports.default = router;
