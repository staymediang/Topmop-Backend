"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controllers/profileController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get user profile
router.get("/profile", authMiddleware_1.verifyToken, profileController_1.getUserProfile);
// Edit user profile
router.put("/profile", authMiddleware_1.verifyToken, profileController_1.editUserProfile);
// Update user role (super admin only)
router.put("/role", authMiddleware_1.verifyToken, authMiddleware_1.isSuperAdmin, profileController_1.updateUserRole);
// Get all users (super admin only)
router.get("/all", authMiddleware_1.verifyToken, authMiddleware_1.isSuperAdmin, profileController_1.getAllUsers);
// Delete user (super admin only)
router.delete("/:userId", authMiddleware_1.verifyToken, authMiddleware_1.isSuperAdmin, profileController_1.deleteUser);
// Add new user (super admin only)
router.post("/", authMiddleware_1.verifyToken, authMiddleware_1.isSuperAdmin, profileController_1.addUser);
module.exports = router;
exports.default = router;