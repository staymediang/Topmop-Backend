"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Notification_1 = require("../controllers/Notification");
const router = express_1.default.Router();
// Get notifications
router.get('/', Notification_1.getNotifications);
// Create a new notification
router.post('/', Notification_1.createNotification);
// Toggle the status of a notification
router.put('/:id', Notification_1.toggleNotification);
exports.default = router;
