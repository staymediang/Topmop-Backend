import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // Enables auto-sync for development
    logging: true,     // Logs SQL queries
    entities: ["dist/src/models/*.js"],
    migrations: ["dist/src/migrations/*.js"],  
});

// Initialize the Data Source
AppDataSource.initialize()
    .then(() => console.log("Data Source has been initialized!"))
    .catch((error) => console.error("Error initializing Data Source:", error));
