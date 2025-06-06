"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getSingleUser = exports.addUser = exports.getAllUsers = exports.updateUserRole = exports.editUserProfile = exports.getUserProfile = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Get profile
const getUserProfile = async (req, res) => {
    const userId = req.user?.userId;
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
};
exports.getUserProfile = getUserProfile;
// Edit user profile: Fetch and update, including role
const editUserProfile = async (req, res) => {
    const userId = req.body.userId; // Fetch userId from the request body
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Fetch user details
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // If no update data, return user details for prefill
        const { name, email, phoneNumber, address, role } = req.body;
        if (!name && !email && !phoneNumber && !address && !role) {
            return res.status(200).json({ user });
        }
        // Validate role if provided
        if (role && !["user", "admin", "super admin", "booking_manager"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }
        // Update allowed fields only
        user.name = name || user.name;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.address = address || user.address;
        user.role = role || user.role;
        await userRepo.save(user);
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};
exports.editUserProfile = editUserProfile;
const updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;
    if (!["user", "admin", "super admin", "booking_manager"].includes(newRole)) {
        return res.status(400).json({ message: "Invalid role specified" });
    }
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.role = newRole;
        await userRepo.save(user);
        res.status(200).json({ message: "User role updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Error updating user role", error: error.message });
    }
};
exports.updateUserRole = updateUserRole;
// Get all users with pagination
const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const [users, totalUsers] = await userRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: "DESC" }, // Order by creation date
        });
        const totalPages = Math.ceil(totalUsers / limit);
        res.status(200).json({
            currentPage: page,
            totalPages,
            totalUsers,
            users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
// Add a new user
const addUser = async (req, res) => {
    const { name, email, phoneNumber, address, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Check if the email is already in use
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already in use" });
        }
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create a new user
        const newUser = userRepo.create({
            name,
            email,
            phoneNumber,
            address,
            password: hashedPassword, // Use hashed password
            role: role || "user", // Default role is "user"
        });
        await userRepo.save(newUser);
        res.status(201).json({ message: "User created successfully", user: newUser });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};
exports.addUser = addUser;
const getSingleUser = async (req, res) => {
    const userId = req.params.id; // Extract user ID from route parameters
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Fetch user by ID
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};
exports.getSingleUser = getSingleUser;
// Delete a single user
const deleteUser = async (req, res) => {
    const userId = req.params.id; // Extract user ID from route parameters
    try {
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        // Fetch user to confirm existence
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Delete user
        await userRepo.delete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};
exports.deleteUser = deleteUser;
