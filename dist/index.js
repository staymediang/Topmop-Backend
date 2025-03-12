"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("reflect-metadata");
const database_1 = require("./src/config/database");
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const bookingRoutes_1 = __importDefault(require("./src/routes/admin/bookingRoutes"));
const serviceRoutes_1 = __importDefault(require("./src/routes/admin/serviceRoutes"));
const notificationRoutes_1 = __importDefault(require("./src/routes/notificationRoutes"));
const profileRoutes_1 = __importDefault(require("./src/routes/profileRoutes"));
const paymentRoutes_1 = __importDefault(require("./src/routes/paymentRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const stripe_1 = __importDefault(require("stripe"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// 🔹 Enable CORS for specific origins
app.use((0, cors_1.default)({
    origin: ["https://topmopcleaningsolutions.co.uk", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// 🔹 Middleware for JSON requests (Keep this before other routes)
app.use(express_1.default.json());
// 🔹 Serve uploaded images
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// 🔹 Define root route
app.get("/", (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    res.send("Welcome to the API!");
});
// 🔹 Use API routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/booking", bookingRoutes_1.default);
app.use("/api/admin", serviceRoutes_1.default);
app.use("/api/notification", notificationRoutes_1.default);
app.use("/api/profile", profileRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default);
// 🔹 STRIPE WEBHOOK (Must use raw body parser)
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// Stripe webhook requires `express.raw()` instead of `express.json()`
app.post("/api/payment/webhook", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!STRIPE_WEBHOOK_SECRET) {
        console.error("❌ Missing STRIPE_WEBHOOK_SECRET in environment variables.");
        return res.status(500).json({ message: "Internal server error" });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).json({ message: `Webhook error: ${err.message}` });
    }
    console.log("✅ Stripe webhook received:", event.type);
    res.status(200).json({ received: true });
});
// 🔹 Initialize database and start the server
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("✅ Database connected");
    app.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${port}`);
    });
})
    .catch((error) => console.error("❌ Database connection error:", error));
