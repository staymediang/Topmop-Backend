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

// Initialize the database and start the server
AppDataSource.initialize()
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
