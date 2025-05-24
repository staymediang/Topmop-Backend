import express from "express";
import { Router } from "express";
import { signup, login,  } from "../controllers/authControllers";
import { sendResetPasswordLink, resetPassword } from "../controllers/authControllers";

const router = Router();

router.post("/signup", signup );
router.post("/login", login );
router.post("/send-reset-link", sendResetPasswordLink);
router.post("/reset-password", resetPassword);

export default router;
