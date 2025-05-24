import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define the super admin email
const SUPER_ADMIN_EMAIL = "iloriemmanuel00@gmail.com";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup
export const signup = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password, role } = req.body;

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOneBy({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? "super admin" : role || "user",
    });

    await userRepository.save(newUser);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const normalizedRole = user.role?.trim().toLowerCase() || "user";

    const token = jwt.sign(
      { userId: user.id, role: normalizedRole },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole
      } 
    });
  } catch (error) {
    console.error("Login error:", error);  // Optional: helpful for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Email Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send Reset Password Link
export const sendResetPasswordLink = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    // Create a reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "15m" });
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
  } catch (error) {
    return res.status(500).json({ message: "Error sending reset link", error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    // Verify the token
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as JwtPayload;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
