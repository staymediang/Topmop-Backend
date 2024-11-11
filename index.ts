import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors"; // Import the cors module
import "reflect-metadata"; 
import { AppDataSource } from "./src/config/database"; 
import authRoutes from "./src/routes/authRoutes"; 
import bookingRoutes from "./src/routes/admin/bookingRoutes"; 
import serviceRoutes from "./src/routes/admin/serviceRoutes"; 
import dotenv from "dotenv"; 
import path from "path"; 

dotenv.config();

const app = express();

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

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Load SSL credentials
const sslOptions = {
    key: fs.readFileSync("/etc/ssl/private/selfsigned.key"),
    cert: fs.readFileSync("/etc/ssl/certs/selfsigned.crt")
};

// Initialize database and start the server with HTTPS
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");

        https.createServer(sslOptions, app).listen(process.env.PORT || 5001, () => {
            console.log("HTTPS Server running on port", process.env.PORT || 5001);
        });
    })
    .catch((error) => console.error("Database connection error: ", error));