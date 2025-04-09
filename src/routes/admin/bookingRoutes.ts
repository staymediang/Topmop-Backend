import express from 'express';
import {
    setBookingPreferences,
    setApartmentDetails,
    getProfile,
    updateProfile,
    getBookingDetails,
    getUserBookingHistory,
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
router.post('/frequency',  setBookingPreferences);
router.post('/requirements', setApartmentDetails);



// User profile related routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Booking details routes
router.get("/history/user", verifyToken, getUserBookingHistory);
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
