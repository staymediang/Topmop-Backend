"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendResetPasswordLink = exports.login = exports.signup = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Define the super admin email
const superAdminEmail = "iloriemmanuel00@gmail.com";
// Signup
const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    try {
        console.log("Checking for existing user with email:", email);
        const existingUser = await database_1.AppDataSource.getRepository(User_1.User).findOneBy({ email: email.toLowerCase() });
        console.log("Existing user:", existingUser);
        if (existingUser)
            return res.status(400).json({ message: "Email already in use" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User();
        user.name = name;
        user.email = email;
        user.password = hashedPassword;
        // Assign the super admin role if the email matches
        user.role = (email.toLowerCase() === superAdminEmail.toLowerCase()) ? "super admin" : (role || "user");
        await database_1.AppDataSource.getRepository(User_1.User).save(user);
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Signup failed", error });
    }
};
exports.signup = signup;
// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await database_1.AppDataSource.getRepository(User_1.User).findOneBy({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ message: "Invalid email or password" });
        // 🔹 Normalize role before issuing a token
        const normalizedRole = user.role.trim().toLowerCase();
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: normalizedRole }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        return res.status(500).json({ message: "Login failed", error });
    }
};
exports.login = login;
/// Configure the transporter for sending emails
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.hostinger.com", // Hostinger's SMTP server
    port: 465, // Secure port for SMTP
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL, // Your Hostinger email address
        pass: process.env.EMAIL_PASSWORD,
    },
});
// Send Reset Password Link
const sendResetPasswordLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await database_1.AppDataSource.getRepository(User_1.User).findOneBy({ email });
        if (!user)
            return res.status(404).json({ message: "User with this email not found" });
        // Create a reset token
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        // Send email with reset link
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
        return res.status(500).json({ message: "Error sending reset link", error });
    }
};
exports.sendResetPasswordLink = sendResetPasswordLink;
// Reset Password
const resetPassword = async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;
    try {
        if (!token)
            return res.status(400).json({ message: "Invalid or missing token" });
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.AppDataSource.getRepository(User_1.User).findOneBy({ id: decoded.userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Hash the new password and update
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await database_1.AppDataSource.getRepository(User_1.User).save(user);
        return res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error resetting password", error });
    }
};
exports.resetPassword = resetPassword;
