// src/controllers/authController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Define the super admin email
const superAdminEmail = "iloriemmanuel00@gmail.com";

// Signup
export const signup = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password, role } = req.body;

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    console.log("Checking for existing user with email:", email);
    const existingUser = await AppDataSource.getRepository(User).findOneBy({ email: email.toLowerCase() });
    console.log("Existing user:", existingUser);
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    // Assign the super admin role if the email matches
    user.role = (email.toLowerCase() === superAdminEmail) ? "super admin" : (role || "user");
    
    await AppDataSource.getRepository(User).save(user);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOneBy({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
};

/// Configure the transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger's SMTP server
  port: 465, // Secure port for SMTP
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL, // Your Hostinger email address
    pass: process.env.EMAIL_PASSWORD, // Your Hostinger email password
  },
});


// Send Reset Password Link
export const sendResetPasswordLink = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOneBy({ email });
    if (!user) return res.status(404).json({ message: "User with this email not found" });

    // Create a reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
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
  } catch (error) {
    return res.status(500).json({ message: "Error sending reset link", error });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    if (!token) return res.status(400).json({ message: "Invalid or missing token" });

    // Verify the token
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const user = await AppDataSource.getRepository(User).findOneBy({ id: decoded.userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await AppDataSource.getRepository(User).save(user);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error resetting password", error });
  }
};