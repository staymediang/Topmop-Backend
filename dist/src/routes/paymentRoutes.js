"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentContoller_1 = require("../controllers/paymentContoller");
const body_parser_1 = __importDefault(require("body-parser"));
const router = express_1.default.Router();
router.post('/initiate', paymentContoller_1.initiatePayment);
router.post('/webhook', body_parser_1.default.raw({ type: 'application/json' }), paymentContoller_1.verifyPayment); // Correct setup
exports.default = router;
