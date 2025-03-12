import express from "express";
import cors from "cors";
import "reflect-metadata";
import { AppDataSource } from "./src/config/database";
import authRoutes from "./src/routes/authRoutes";
import bookingRoutes from "./src/routes/admin/bookingRoutes";
import serviceRoutes from "./src/routes/admin/serviceRoutes";
import notificationRoutes from "./src/routes/notificationRoutes";
import profileRoutes from "./src/routes/profileRoutes";
import paymentRoutes from "./src/routes/paymentRoutes";
import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// 🔹 Enable CORS for specific origins
app.use(
    cors({
        origin: ["https://topmopcleaningsolutions.co.uk", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// 🔹 Middleware for JSON requests (Keep this before other routes)
app.use(express.json());

// 🔹 Serve uploaded images
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

// 🔹 Define root route
app.get("/", (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    res.send("Welcome to the API!");
});

// 🔹 Use API routes
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", serviceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes);

// 🔹 STRIPE WEBHOOK (Must use raw body parser)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

// Stripe webhook requires `express.raw()` instead of `express.json()`
app.post(
    "/api/payment/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"] as string;

        if (!STRIPE_WEBHOOK_SECRET) {
            console.error("❌ Missing STRIPE_WEBHOOK_SECRET in environment variables.");
            return res.status(500).json({ message: "Internal server error" });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error("❌ Webhook signature verification failed:", err.message);
            return res.status(400).json({ message: `Webhook error: ${err.message}` });
        }

        console.log("✅ Stripe webhook received:", event.type);
        res.status(200).json({ received: true });
    }
);

// 🔹 Initialize database and start the server
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Database connected");

        app.listen(port, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    })
    .catch((error) => console.error("❌ Database connection error:", error));
