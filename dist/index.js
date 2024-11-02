"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const database_1 = require("./src/config/database");
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const bookingRoutes_1 = __importDefault(require("./src/routes/admin/bookingRoutes"));
const serviceRoutes_1 = __importDefault(require("./src/routes/admin/serviceRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the API!'); // Customize this message as needed
});
// Use defined routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/booking", bookingRoutes_1.default);
app.use("/api/admin", serviceRoutes_1.default);
// Serve uploaded images
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads"))); // Adjust path as necessary
// Initialize the database and start the server
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
})
    .catch(error => {
    console.error("Database connection error: ", error);
});
