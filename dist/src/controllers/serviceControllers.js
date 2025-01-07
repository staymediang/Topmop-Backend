"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.getAllServices = exports.createService = void 0;
const database_1 = require("../config/database");
const Service_1 = require("../models/Service");
const path_1 = __importDefault(require("path"));
const User_1 = require("../models/User");
const createService = async (req, res) => {
    const { title, description } = req.body;
    const imageUrl = req.file ? path_1.default.join("uploads", req.file.filename) : null;
    try {
        const service = new Service_1.Service();
        service.title = title;
        service.description = description;
        service.imageUrl = imageUrl;
        // Fetch the user by ID to set the createdBy field
        const userRepo = database_1.AppDataSource.getRepository(User_1.User);
        const userId = req.user?.userId; // userId is now a string
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await userRepo.findOne({ where: { id: userId } }); // Query by string userId
        if (!user)
            return res.status(404).json({ message: "User not found" });
        service.createdBy = user; // Set the user instance
        await database_1.AppDataSource.getRepository(Service_1.Service).save(service);
        res.status(201).json({ message: "Service created successfully", service });
    }
    catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service", error: error.message });
    }
};
exports.createService = createService;
// Get all services
const getAllServices = async (_req, res) => {
    try {
        const services = await database_1.AppDataSource.getRepository(Service_1.Service).find();
        res.status(200).json(services);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve services", error });
    }
};
exports.getAllServices = getAllServices;
// Update a service
const updateService = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const imageUrl = req.file ? path_1.default.join("uploads", req.file.filename) : undefined;
    try {
        const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
        const service = await serviceRepo.findOneBy({ id: parseInt(id) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        service.title = title || service.title;
        service.description = description || service.description;
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
// Delete a service
const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const serviceRepo = database_1.AppDataSource.getRepository(Service_1.Service);
        const service = await serviceRepo.findOneBy({ id: parseInt(id) });
        if (!service)
            return res.status(404).json({ message: "Service not found" });
        await serviceRepo.remove(service);
        res.status(200).json({ message: "Service deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete service", error });
    }
};
exports.deleteService = deleteService;
