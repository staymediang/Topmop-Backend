import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors"; // Import the cors module
import "reflect-metadata"; 
import { AppDataSource } from "./src/config/database"; 
import authRoutes from "./src/routes/authRoutes"; 
import bookingRoutes from "./src/routes/admin/bookingRoutes"; 
import serviceRoutes from "./src/routes/admin/serviceRoutes"; 
import notificationRoutes from "./src/routes/notificationRoutes";
import profileRoutes from "./src/routes/profileRoutes"
import dotenv from "dotenv"; 
import path from "path"; 

dotenv.config();

const app = express();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

// Enable CORS for all origins
app.use(cors()); // Allow requests from any origin during development

app.use(express.json()); 

// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Use defined routes
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", serviceRoutes);
app.use("/api/notification", notificationRoutes)
app.use("/api/profile", profileRoutes)


// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Load SSL credentials
const sslOptions = {
    key: fs.readFileSync("/etc/nginx/ssl/nginx-selfsigned.key"),
    cert: fs.readFileSync("/etc/nginx/ssl/nginx-selfsigned.crt")
};

// Initialize database and start the server with HTTPS
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");

        https.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
            console.log("HTTPS Server running on port", port);
        });
    })
    .catch((error) => console.error("Database connection error: ", error));