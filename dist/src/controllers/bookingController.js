"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.getNewBookings = exports.getCompletedBookings = exports.getOngoingBookings = exports.cancelBooking = exports.getBookingSummary = exports.getUpcomingBookings = exports.getUserBookingHistory = exports.getBookingDetails = exports.updateProfile = exports.getProfile = exports.setPersonalDetails = exports.setApartmentDetails = exports.setBookingPreferences = void 0;
const Booking_1 = require("../models/Booking");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
const Booking_2 = require("../models/Booking");
const setBookingPreferences = async (req, res) => {
    const { userId, frequency, accessType, cleaningDate, cleaningTime, } = req.body;
    const queryRunner = database_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const user = await queryRunner.manager.findOne(User_1.User, { where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const booking = new Booking_1.Booking();
        booking.user = user;
        booking.frequency = frequency;
        booking.accessType = accessType;
        booking.cleaningDate = new Date(cleaningDate);
        booking.cleaningTime = cleaningTime;
        booking.amount = 0.0; // Default, to be calculated later
        booking.paymentType = 'pending';
        // Default empty fields for now
        booking.address = new Booking_2.Address();
        booking.hoursRequired = 0;
        await queryRunner.manager.save(booking);
        await queryRunner.commitTransaction();
        res.status(201).json({ message: 'Booking preferences set', bookingId: booking.id });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: 'Failed to set preferences', error: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.setBookingPreferences = setBookingPreferences;
const setApartmentDetails = async (req, res) => {
    const { bookingId, apartmentType, toilets, kitchens, livingRooms, bedrooms } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.apartmentType = apartmentType;
        booking.roomDetails = {
            toilets,
            kitchens,
            livingRooms,
            bedrooms,
        };
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Apartment details saved successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to save apartment details', error: error.message });
    }
};
exports.setApartmentDetails = setApartmentDetails;
const setPersonalDetails = async (req, res) => {
    const { bookingId, title, firstName, lastName, contactNumber, email, city, street, number, postalCode, } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.title = title;
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;
        booking.address = {
            street,
            number,
            city,
            postalCode,
        };
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details saved successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to save personal details', error: error.message });
    }
};
exports.setPersonalDetails = setPersonalDetails;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId; // Ensure this is treated as a string
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const profile = await bookingRepo.findOne({ where: { user: { id: userId } } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        const { firstName, lastName, email, contactNumber, address } = profile;
        const { street, number, city, postalCode } = address || {}; // Handle missing address
        res.status(200).json({
            firstName,
            lastName,
            email,
            contactNumber,
            address: { street, number, city, postalCode }
        });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { firstName, lastName, contactNumber, email, address } = req.body;
    const { street, number, city, postalCode } = address || {};
    try {
        const userId = req.user?.userId;
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const profile = await bookingRepo.findOne({ where: { user: { id: userId } } });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        profile.firstName = firstName || profile.firstName;
        profile.lastName = lastName || profile.lastName;
        profile.contactNumber = contactNumber || profile.contactNumber;
        profile.email = email || profile.email;
        // **Explicitly create a new Address object**
        profile.address = {
            street: street || profile.address?.street,
            number: number || profile.address?.number,
            city: city || profile.address?.city,
            postalCode: postalCode || profile.address?.postalCode,
        };
        // Save the updated profile
        await bookingRepo.save(profile);
        res.status(200).json({ message: "Profile updated successfully", profile });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getBookingDetails = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ booking });
    }
    catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: 'Error fetching booking details', error: error.message });
    }
};
exports.getBookingDetails = getBookingDetails;
const getUserBookingHistory = async (req, res) => {
    const userId = req.user?.userId?.toString(); // Extract user ID from authenticated request
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        // Fetch all bookings for this user
        const bookings = await bookingRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: "DESC" }, // Sort by latest bookings first
            relations: ["user"], // Include user details
        });
        if (bookings.length === 0) {
            return res.status(404).json({ message: "No booking history found for this user" });
        }
        res.status(200).json({ bookings });
    }
    catch (error) {
        console.error("Error fetching user booking history:", error);
        res.status(500).json({ message: "Error fetching booking history", error: error.message });
    }
};
exports.getUserBookingHistory = getUserBookingHistory;
const getUpcomingBookings = async (req, res) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const upcomingBookings = await bookingRepo.find({
            where: {
                user: { id: userId }, // Ensure `user` is treated as a relation
                cleaningStartDate: (0, typeorm_1.MoreThanOrEqual)(new Date()),
            },
            relations: ['user'], // Include related user data
        });
        res.status(200).json({ upcomingBookings });
    }
    catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        res.status(500).json({ message: 'Error fetching upcoming bookings', error: error.message });
    }
};
exports.getUpcomingBookings = getUpcomingBookings;
// Get Booking Summary
const getBookingSummary = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({
            frequency: booking.frequency,
            hoursRequired: booking.hoursRequired,
            preferredDay: booking.preferredDays,
            preferredTime: booking.preferredTimes,
            cleaningStartDate: booking.cleaningStartDate,
            needsIroning: booking.needsIroning,
            accessInstructions: booking.accessInstructions,
            additionalInfo: booking.additionalInfo,
            referralSource: booking.referralSource,
            paymentType: booking.paymentType,
            amount: booking.amount,
            createdAt: booking.createdAt,
        });
    }
    catch (error) {
        console.error("Error fetching booking summary:", error);
        res.status(500).json({ message: 'Error fetching booking summary', error: error.message });
    }
};
exports.getBookingSummary = getBookingSummary;
// Admin: Cancel Booking
const cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.status = Booking_1.BookingStatus.CANCELLED; // Update status to "cancelled"
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Booking cancelled successfully', booking });
    }
    catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};
exports.cancelBooking = cancelBooking;
// Admin: Get Ongoing Bookings
const getOngoingBookings = async (req, res) => {
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const ongoingBookings = await bookingRepo.find({
            where: { status: Booking_1.BookingStatus.ONGOING },
            relations: ['user'],
        });
        res.status(200).json({ ongoingBookings });
    }
    catch (error) {
        console.error("Error fetching ongoing bookings:", error);
        res.status(500).json({ message: 'Error fetching ongoing bookings', error: error.message });
    }
};
exports.getOngoingBookings = getOngoingBookings;
// Admin: Get Completed Bookings
const getCompletedBookings = async (req, res) => {
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const completedBookings = await bookingRepo.find({
            where: { status: Booking_1.BookingStatus.COMPLETED },
            relations: ['user'],
        });
        res.status(200).json({ completedBookings });
    }
    catch (error) {
        console.error("Error fetching completed bookings:", error);
        res.status(500).json({ message: 'Error fetching completed bookings', error: error.message });
    }
};
exports.getCompletedBookings = getCompletedBookings;
// Admin: Get New Bookings
const getNewBookings = async (req, res) => {
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const newBookings = await bookingRepo.find({
            where: { status: Booking_1.BookingStatus.NEW },
            relations: ['user'],
        });
        res.status(200).json({ newBookings });
    }
    catch (error) {
        console.error("Error fetching new bookings:", error);
        res.status(500).json({ message: 'Error fetching new bookings', error: error.message });
    }
};
exports.getNewBookings = getNewBookings;
// Admin: Get All Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const bookings = await bookingRepo.find({
            relations: ['user'], // Include related entities like user if necessary
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};
exports.getAllBookings = getAllBookings;
