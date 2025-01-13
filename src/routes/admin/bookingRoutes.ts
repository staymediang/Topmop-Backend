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
import { isAdmin, isBookingManager, isSuperAdmin } from "../../middleware/authMiddleware";

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
router.get('/:bookingId', getBookingDetails);
router.get('/history', getBookingHistory);
router.get('/upcoming', getUpcomingBookings);
router.get('/summary/:bookingId', getBookingSummary);
router.get('/', getAllBookings);

// Admin booking management routes
router.delete('/admin/:bookingId', isBookingManager, cancelBooking);
router.get('/admin/ongoing-bookings', isBookingManager, getOngoingBookings);
router.get('/admin/completed-bookings', isBookingManager, getCompletedBookings);
router.get('/admin/new-bookings', isBookingManager, getNewBookings);

export default router;
