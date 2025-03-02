import express from 'express';
import {
    setFrequency,
    setRequirements,
    setPersonalDetails,
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
import {  isBookingManager, verifyToken } from "../../middleware/authMiddleware";

const router = express.Router();

// Define the routes for booking operations
router.post('/frequency', setFrequency);
router.post('/requirements', setRequirements);
router.post('/personal-details', setPersonalDetails);


// User profile related routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Booking details routes
router.get('/history', getBookingHistory);
router.get('/upcoming', getUpcomingBookings);
router.get('/:bookingId', getBookingDetails);
router.get('/summary/:bookingId', getBookingSummary);
router.get('/', getAllBookings);

// Admin booking management routes
router.delete('/admin/:bookingId', verifyToken, isBookingManager, cancelBooking);
router.get('/admin/ongoing-bookings', verifyToken, isBookingManager, getOngoingBookings);
router.get('/admin/completed-bookings', verifyToken, isBookingManager, getCompletedBookings);
router.get('/admin/new-bookings', verifyToken, isBookingManager, getNewBookings);




export default router;
