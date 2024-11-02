"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Signup
const signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await database_1.AppDataSource.getRepository(User_1.User).findOneBy({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already in use" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User();
        user.name = name;
        user.email = email;
        user.password = hashedPassword;
        user.role = role || "user";
        await database_1.AppDataSource.getRepository(User_1.User).save(user);
        return res.status(201).json({ message: "User registered successfully" }); // Add return
    }
    catch (error) {
        return res.status(500).json({ message: "Signup failed", error }); // Add return
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.status(200).json({ message: "Login successful", token }); // Add return
    }
    catch (error) {
        return res.status(500).json({ message: "Login failed", error }); // Add return
    }
};
exports.login = login;
