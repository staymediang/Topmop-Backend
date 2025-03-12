import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Service } from "../models/Service";
import path from "path";
import { User } from "../models/User";

export const createService = async (req: Request, res: Response) => {
  const { title, description, optional, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;


  try {
    const service = new Service();
    service.title = title;
    service.description = description;
    service.imageUrl = imageUrl; // Ensure correct file path is stored

    service.optional = optional; // Assume optional is a JSON string or an array
    service.price = typeof price === "string" ? JSON.parse(price) : price; // Parse if sent as a string

    const userRepo = AppDataSource.getRepository(User);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    service.createdBy = user;

    await AppDataSource.getRepository(Service).save(service);
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service", error: error.message });
  }
};

// Get all services
export const getAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await AppDataSource.getRepository(Service).find();

    if (!services.length) return res.status(404).json({ message: "No services found" });

    // Append base URL to each service's imageUrl
    const BASE_URL = "https://api.topmopcleaningsolutions.co.uk";
    const updatedServices = services.map(service => ({
      ...service,
      imageUrl: service.imageUrl ? `${BASE_URL}${service.imageUrl}` : null,
    }));

    res.status(200).json(updatedServices);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve services", error });
  }
};


// Update a service
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const imageUrl = req.file ? path.join("uploads", req.file.filename) : undefined;

  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOneBy({ id: parseInt(id) });

    if (!service) return res.status(404).json({ message: "Service not found" });

    service.title = title || service.title;
    service.description = description || service.description;
    if (imageUrl) service.imageUrl = imageUrl; // Only update if new file is uploaded

    await serviceRepo.save(service);
    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    res.status(500).json({ message: "Failed to update service", error });
  }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const serviceRepo = AppDataSource.getRepository(Service);
    const service = await serviceRepo.findOneBy({ id: parseInt(id) });

    if (!service) return res.status(404).json({ message: "Service not found" });

    await serviceRepo.remove(service);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete service", error });
  }
};

// Get a single service by ID
export const getServiceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const service = await AppDataSource.getRepository(Service).findOneBy({ id: parseInt(id) });

    if (!service) return res.status(404).json({ message: "Service not found" });

    // Append base URL to imageUrl
    const BASE_URL = "https://api.topmopcleaningsolutions.co.uk";
    if (service.imageUrl) {
      service.imageUrl = `${BASE_URL}${service.imageUrl}`;
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve service", error });
  }
};


