"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../../controllers/bookingController");
const router = express_1.default.Router();
router.post('/frequency', bookingController_1.setFrequency);
router.post('/requirements', bookingController_1.setRequirements);
router.post('/personal-details', bookingController_1.setPersonalDetails);
router.post('/payment', bookingController_1.setPaymentDetails);
exports.default = router;
