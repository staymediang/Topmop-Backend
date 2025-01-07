"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../../controllers/bookingController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// Define the routes for booking operations
router.post('/frequency', bookingController_1.setFrequency);
router.post('/requirements', bookingController_1.setRequirements);
router.post('/personal-details', bookingController_1.setPersonalDetails);
router.post('/payment', bookingController_1.setPaymentDetails);
// User profile related routes
router.get('/profile', bookingController_1.getProfile);
router.put('/profile', bookingController_1.updateProfile);
// Booking details routes
router.get('/booking/:bookingId', bookingController_1.getBookingDetails);
router.get('/booking/history', bookingController_1.getBookingHistory);
router.get('/booking/upcoming', bookingController_1.getUpcomingBookings);
router.get('/booking/summary/:bookingId', bookingController_1.getBookingSummary);
// Admin booking management routes
router.delete('/admin/:bookingId', authMiddleware_1.isAdmin, authMiddleware_1.isSuperAdmin, bookingController_1.cancelBooking);
router.get('/admin/ongoing-bookings', authMiddleware_1.isAdmin, authMiddleware_1.isSuperAdmin, bookingController_1.getOngoingBookings);
router.get('/admin/completed-bookings', authMiddleware_1.isAdmin, authMiddleware_1.isSuperAdmin, bookingController_1.getCompletedBookings);
router.get('/admin/new-bookings', authMiddleware_1.isAdmin, authMiddleware_1.isSuperAdmin, bookingController_1.getNewBookings);
exports.default = router;
