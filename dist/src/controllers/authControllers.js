"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendResetPasswordLink = exports.login = exports.signup = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Define the super admin email
const SUPER_ADMIN_EMAIL = "iloriemmanuel00@gmail.com";
// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Signup
const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    try {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const existingUser = await userRepository.findOneBy({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? "super admin" : role || "user",
        });
        await userRepository.save(newUser);
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Signup failed", error: error.message });
    }
};
exports.signup = signup;
// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOneBy({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        // Normalize role before issuing a token
        const normalizedRole = user.role.trim().toLowerCase();
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: normalizedRole }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        return res.status(500).json({ message: "Login failed", error: error.message });
    }
};
exports.login = login;
// Email Transporter
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
// Send Reset Password Link
const sendResetPasswordLink = async (req, res) => {
    const { email } = req.body;
    try {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOneBy({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email not found" });
        }
        // Create a reset token
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        // Send email
        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL}>`,
            to: email,
            subject: "Password Reset",
            html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
        });
        return res.status(200).json({ message: "Reset link sent to your email" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error sending reset link", error: error.message });
    }
};
exports.sendResetPasswordLink = sendResetPasswordLink;
// Reset Password
const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: "Invalid or missing token" });
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOneBy({ id: decoded.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await userRepository.save(user);
        return res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};
exports.resetPassword = resetPassword;
