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
router.post("/services", authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, uploadMiddleware_1.default.single("image"), serviceControllers_1.createService);
router.get("/services", serviceControllers_1.getAllServices);
router.get("/services/:id", serviceControllers_1.getServiceById); // 🔹 New route to get a single service
router.patch("/services/:id", authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, uploadMiddleware_1.default.single("image"), serviceControllers_1.updateService);
router.delete("/services/:id", authMiddleware_1.verifyToken, authMiddleware_1.isAdmin, serviceControllers_1.deleteService);
exports.default = router;
