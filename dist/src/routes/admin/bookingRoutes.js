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
router.post('/frequency', bookingController_1.setBookingPreferences);
router.post('/requirements', bookingController_1.setApartmentDetails);
router.post('/additional-info', bookingController_1.setDirtLevel);
// User profile related routes
router.get('/profile', bookingController_1.getProfile);
router.put('/profile', bookingController_1.updateProfile);
// Booking details routes
router.get("/history/user", authMiddleware_1.verifyToken, bookingController_1.getUserBookingHistory);
router.get('/upcoming', bookingController_1.getUpcomingBookings);
router.get('/:bookingId', bookingController_1.getBookingDetails);
router.get('/summary/:bookingId', bookingController_1.getBookingSummary);
router.get('/', bookingController_1.getAllBookings);
// Admin booking management routes
router.delete('/admin/:bookingId', authMiddleware_1.verifyToken, authMiddleware_1.isBookingManager, bookingController_1.cancelBooking);
router.get('/admin/ongoing-bookings', authMiddleware_1.verifyToken, authMiddleware_1.isBookingManager, bookingController_1.getOngoingBookings);
router.get('/admin/completed-bookings', authMiddleware_1.verifyToken, authMiddleware_1.isBookingManager, bookingController_1.getCompletedBookings);
router.get('/admin/new-bookings', authMiddleware_1.verifyToken, authMiddleware_1.isBookingManager, bookingController_1.getNewBookings);
exports.default = router;
