import express from "express";
import { getUserProfile, editUserProfile, updateUserRole, getAllUsers,deleteUser, addUser, getSingleUser } from "../controllers/profileController";
import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Get user profile
router.get("/", verifyToken, getUserProfile);

router.get("/:id", verifyToken, getSingleUser);

// Edit user profile
router.put("/edit", verifyToken, editUserProfile);

// Update user role (super admin only)
router.put("/role", verifyToken, isSuperAdmin, updateUserRole);

// Get all users (super admin only)

router.get("/all", verifyToken, isSuperAdmin, getAllUsers);

// Delete user (super admin only)

router.delete("/:userId", verifyToken, isSuperAdmin, deleteUser);

// Add new user (super admin only)

router.post("/", verifyToken, isSuperAdmin, addUser);

module.exports = router;



export default router;
