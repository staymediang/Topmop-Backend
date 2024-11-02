import { Router } from "express";
import { createService, getAllServices, updateService, deleteService } from "../../controllers/serviceControllers";
import { isAdmin } from "../../middleware/authMiddleware";
import upload from "../../middleware/uploadMiddleware";

const router = Router();

router.post("/services", isAdmin, upload.single("image"), createService); // Admin-only route with image upload
router.get("/services", getAllServices); // Public route for viewing services
router.patch("/services/:id", isAdmin, upload.single("image"), updateService); // Admin-only route with image upload
router.delete("/services/:id", isAdmin, deleteService); // Admin-only route

export default router;
