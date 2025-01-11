import express from 'express';
import {
    setFrequency,
    setRequirements,
    setPersonalDetails,
    setPaymentDetails,
    getProfile,
    updateProfile,
    getBookingDetails,
    getBookingHistory,
    getUpcomingBookings,
    getBookingSummary,
    cancelBooking,
    getOngoingBookings,
    getCompletedBookings,
    getNewBookings,
    getAllBookings
} from '../../controllers/bookingController';
import { isAdmin, isSuperAdmin } from "../../middleware/authMiddleware";

const router = express.Router();

// Define the routes for booking operations
router.post('/frequency', setFrequency);
router.post('/requirements', setRequirements);
router.post('/personal-details', setPersonalDetails);
router.post('/payment', setPaymentDetails);

// User profile related routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Booking details routes
router.get('/booking/:bookingId', getBookingDetails);
router.get('/booking/history', getBookingHistory);
router.get('/booking/upcoming', getUpcomingBookings);
router.get('/booking/summary/:bookingId', getBookingSummary);
router.get('/booking', getAllBookings);

// Admin booking management routes
router.delete('/admin/:bookingId', isAdmin, isSuperAdmin, cancelBooking);
router.get('/admin/ongoing-bookings', isAdmin, isSuperAdmin, getOngoingBookings);
router.get('/admin/completed-bookings', isAdmin, isSuperAdmin, getCompletedBookings);
router.get('/admin/new-bookings', isAdmin, isSuperAdmin, getNewBookings);

export default router;
