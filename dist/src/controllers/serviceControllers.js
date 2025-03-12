"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getServiceById = exports.getAllServices = exports.createService = void 0;
const database_1 = require("../config/database");
const Service_1 = require("../models/Service");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const User_1 = require("../models/User");
const BASE_URL = "https://api.topmopcleaningsolutions.co.uk";
// 🔹 Create a service
const createService = async (req, res) => {
    console.log("Uploaded file:", req.file); // Debugging
    const { title, description, optional, price } = req.body;
    if (!req.file)
        return res.status(400).json({ message: "Image is required" });
    try {
        const service = new Service_1.Service();
        service.title = title;
        service.description = description;
        service.imageUrl = `${BASE_URL}/uploads/${req.file.filename}`;
        service.optional = typeof optional === "string" ? JSON.parse(optional) : optional;
        service.price = isNaN(Number(price)) ? JSON.parse(price) : Number(price);
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const userId = req.user?.userId;
        if (!userId)
            return res.status(400).json({ message: "User ID is required" });
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        service.createdBy = user;
        await database_1.AppDataSource.getRepository(Service_1.Service).save(service);
        res.status(201).json({ message: "Service created successfully", service });
    }
    catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service", error: error.message });
    }
};
exports.createService = createService;
// 🔹 Get all services
const getAllServices = async (_req, res) => {
    try {
        const services = await database_1.AppDataSource.getRepository(Service_1.Service).find();
        if (!services.length)
            return res.status(404).json({ message: "No services found" });
        const updatedServices = services.map(service => ({
            ...service,
            imageUrl: service.imageUrl ? `${BASE_URL}/uploads/${path_1.default.basename(service.imageUrl)}` : null
        }));
        res.status(200).json(updatedServices);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve services", error });
    }
};
exports.getAllServices = getAllServices;
// 🔹 Get a single service by ID
const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await database_1.AppDataSource.getRepository(Service_1.Service).findOneBy({ id: parseInt(id) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        // Fix image URL
        if (service.imageUrl) {
            service.imageUrl = `${BASE_URL}/uploads/${path_1.default.basename(service.imageUrl)}`;
        }
        res.status(200).json(service);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve service", error });
    }
};
exports.getServiceById = getServiceById;
// 🔹 Update a service
const updateService = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : undefined;
    try {
        const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
        const service = await serviceRepo.findOneBy({ id: parseInt(id) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        if (title)
            service.title = title;
        if (description)
            service.description = description;
        if (imageUrl)
            service.imageUrl = imageUrl; // Only update if new file is uploaded
        await serviceRepo.save(service);
        res.status(200).json({ message: "Service updated successfully", service });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update service", error });
    }
};
exports.updateService = updateService;
// 🔹 Delete a service
const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
        const service = await serviceRepo.findOneBy({ id: parseInt(id) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        // Delete image file from server
        if (service.imageUrl) {
            const imagePath = path_1.default.join(process.cwd(), "uploads", path_1.default.basename(service.imageUrl));
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        await serviceRepo.remove(service);
        res.status(200).json({ message: "Service deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete service", error });
    }
};
exports.deleteService = deleteService;
