"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Import the cors module
require("reflect-metadata");
const database_1 = require("./src/config/database");
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const bookingRoutes_1 = __importDefault(require("./src/routes/admin/bookingRoutes"));
const serviceRoutes_1 = __importDefault(require("./src/routes/admin/serviceRoutes"));
const notificationRoutes_1 = __importDefault(require("./src/routes/notificationRoutes"));
const profileRoutes_1 = __importDefault(require("./src/routes/profileRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
// Enable CORS for all origins
app.use((0, cors_1.default)()); // Allow requests from any origin during development
app.use(express_1.default.json());
// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
// Use defined routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/booking", bookingRoutes_1.default);
app.use("/api/admin", serviceRoutes_1.default);
app.use("/api/notification", notificationRoutes_1.default);
app.use("/api/profile", profileRoutes_1.default);
// Serve uploaded images
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Load SSL credentials
const sslOptions = {
    key: fs_1.default.readFileSync("/etc/nginx/ssl/nginx-selfsigned.key"),
    cert: fs_1.default.readFileSync("/etc/nginx/ssl/nginx-selfsigned.crt")
};
// Initialize database and start the server with HTTPS
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    https_1.default.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
        console.log("HTTPS Server running on port", port);
    });
})
    .catch((error) => console.error("Database connection error: ", error));
