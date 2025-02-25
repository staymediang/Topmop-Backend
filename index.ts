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

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS for specific origins
app.use(cors({
    origin: ["https://topmopcleaningsolutions.co.uk"], // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));


app.use(express.json()); 

// Define a route for the root path
app.get('/', (req, res) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    res.send('Welcome to the API!');
});

// Use defined routes
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", serviceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/profile", profileRoutes);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Initialize database and start the server
AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");

        app.listen(port, '0.0.0.0', () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => console.error("Database connection error: ", error));
