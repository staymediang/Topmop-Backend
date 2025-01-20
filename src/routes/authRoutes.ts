import express from "express";
import { Router } from "express";
import { signup, login,  } from "../controllers/authControllers";

const router = Router();

router.post("/signup", signup );
router.post("/login", login );

export default router;
