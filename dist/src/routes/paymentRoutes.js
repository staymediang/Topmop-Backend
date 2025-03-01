"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentContoller_1 = require("../controllers/paymentContoller");
const router = express_1.default.Router();
router.post('/initiate', paymentContoller_1.initiatePayment);
router.post('/webhook', paymentContoller_1.verifyPayment); // Webhook for Paystack transactions
exports.default = router;
