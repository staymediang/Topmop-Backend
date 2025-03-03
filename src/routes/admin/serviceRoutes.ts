import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById, // Import the new function
  updateService,
  deleteService,
} from "../../controllers/serviceControllers";
import { isAdmin, verifyToken } from "../../middleware/authMiddleware";
import upload from "../../middleware/uploadMiddleware";

const router = Router();

router.post("/services", verifyToken, isAdmin, upload.single("image"), createService);
router.get("/services", getAllServices);
router.get("/services/:id", getServiceById); // 🔹 New route to get a single service
router.patch("/services/:id", verifyToken, isAdmin, upload.single("image"), updateService);
router.delete("/services/:id", verifyToken, isAdmin, deleteService);

export default router;
