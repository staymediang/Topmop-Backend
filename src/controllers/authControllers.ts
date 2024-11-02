// src/controllers/authController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
