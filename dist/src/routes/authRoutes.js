"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authControllers_1 = require("../controllers/authControllers");
const router = (0, express_1.Router)();
router.post("/signup", authControllers_1.signup);
router.post("/login", authControllers_1.login);
exports.default = router;
