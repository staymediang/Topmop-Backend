"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // Enables auto-sync for development
    logging: true, // Logs SQL queries
    entities: ["dist/src/models/*.js"],
    migrations: ["dist/src/migrations/*.js"],
});
// Initialize the Data Source
exports.AppDataSource.initialize()
    .then(() => console.log("Data Source has been initialized!"))
    .catch((error) => console.error("Error initializing Data Source:", error));
