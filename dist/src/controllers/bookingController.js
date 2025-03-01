"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.getNewBookings = exports.getCompletedBookings = exports.getOngoingBookings = exports.cancelBooking = exports.getBookingSummary = exports.getUpcomingBookings = exports.getBookingHistory = exports.getBookingDetails = exports.updateProfile = exports.getProfile = exports.setPaymentDetails = exports.setPersonalDetails = exports.setRequirements = exports.setFrequency = void 0;
const Booking_1 = require("../models/Booking");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const typeorm_1 = require("typeorm");
const Booking_2 = require("../models/Booking");
const setFrequency = async (req, res) => {
    let { frequency, hoursRequired, preferredDay, preferredDays, preferredTime, userId } = req.body;
    const queryRunner = database_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const user = await queryRunner.manager.findOne(User_1.User, { where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const booking = new Booking_1.Booking();
        booking.frequency = frequency;
        // Ensure hoursRequired is a number
        booking.hoursRequired = Number(hoursRequired);
        // Handle both "preferredDay" and "preferredDays"
        if (Array.isArray(preferredDays)) {
            booking.preferredDays = preferredDays;
        }
        else if (Array.isArray(preferredDay)) {
            booking.preferredDays = preferredDay;
        }
        else {
            throw new Error('Invalid format for preferred days');
        }
        if (!preferredTime || typeof preferredTime !== 'string') {
            console.error('Invalid preferredTime:', preferredTime);
            throw new Error('Invalid preferred time format. Expected a string.');
        }
        console.log('Received preferredTime:', preferredTime);
        console.log('Type of preferredTime:', typeof preferredTime);
        booking.preferredTimes = preferredTime;
        // Set default values for required fields
        booking.firstName = '';
        booking.lastName = '';
        booking.contactNumber = '';
        booking.email = '';
        const address = new Booking_2.Address();
        address.street = '';
        address.number = '';
        address.city = '';
        address.postalCode = '';
        booking.address = address;
        booking.amount = 0.0;
        booking.user = user;
        booking.paymentType = 'pending';
        await queryRunner.manager.save(booking);
        await queryRunner.commitTransaction();
        res.status(201).json({ message: 'Frequency set', bookingId: booking.id });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error details:', error);
        res.status(500).json({ message: 'Error setting frequency', error: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.setFrequency = setFrequency;
const setRequirements = async (req, res) => {
    const { bookingId, additionalInfo, // String: Any additional information
    dirtLevel, // Enum: Light, Medium, Heavy
    roomSelection, // Array: Selected rooms (e.g., { room: 'Kitchen', count: 2 })
    additionalServices // Array: Selected additional services (e.g., { service: 'Laundry', count: 1 })
     } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Update booking details
        booking.additionalInfo = additionalInfo || null; // Optional field
        booking.dirtLevel = dirtLevel; // Validate against allowed values (Light, Medium, Heavy)
        booking.roomSelection = roomSelection || []; // Store selected rooms
        booking.additionalServices = additionalServices || []; // Store selected additional services
        await bookingRepo.save(booking);
        res.status(200).json({
            message: 'Requirements set successfully',
            bookingId: booking.id,
            summary: {
                additionalInfo: booking.additionalInfo,
                dirtLevel: booking.dirtLevel,
                roomSelection: booking.roomSelection,
                additionalServices: booking.additionalServices,
            }
        });
    }
    catch (error) {
        console.error("Error setting requirements:", error);
        res.status(500).json({ message: 'Error setting requirements', error: error.message });
    }
};
exports.setRequirements = setRequirements;
const setPersonalDetails = async (req, res) => {
    const { bookingId, title, firstName, lastName, contactNumber, email, address } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId }, relations: ['address'] });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!title || !firstName || !lastName || !contactNumber || !email || !address ||
            !address.street || !address.number || !address.city || !address.postalCode) {
            return res.status(400).json({ message: 'All personal details are required' });
        }
        booking.title = title;
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;
        if (!booking.address) {
            booking.address = new Booking_2.Address();
        }
        booking.address.street = address.street;
        booking.address.number = address.number;
        booking.address.city = address.city;
        booking.address.postalCode = address.postalCode;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details updated successfully' });
    }
    catch (error) {
        console.error("Error updating personal details:", error);
        res.status(500).json({ message: 'Error updating personal details', error: error.message });
    }
};
exports.setPersonalDetails = setPersonalDetails;
const setPaymentDetails = async (req, res) => {
    const { bookingId, paymentType, amount } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId }, relations: ['address'] });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const missingFields = [];
        if (!booking.firstName)
            missingFields.push('firstName');
        if (!booking.lastName)
            missingFields.push('lastName');
        if (!booking.contactNumber)
            missingFields.push('contactNumber');
        if (!booking.email)
            missingFields.push('email');
        if (!booking.address || !booking.address.street || !booking.address.city || !booking.address.postalCode) {
            missingFields.push('address (street, city, postalCode)');
        }
        if (missingFields.length > 0) {
            console.error("Missing fields:", missingFields);
            return res.status(400).json({ message: `Missing required personal details: ${missingFields.join(', ')}` });
        }
        booking.paymentType = paymentType;
        booking.amount = amount;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Payment details set. Booking complete.', booking });
    }
    catch (error) {
        console.error("Error setting payment details:", error);
        res.status(500).json({ message: 'Error setting payment details', error: error.message });
    }
};
exports.setPaymentDetails = setPaymentDetails;
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
    const { firstName, lastName, contactNumber, email, street, number, city, postalCode } = req.body;
    try {
        const userId = req.user?.userId;
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const profile = await bookingRepo.findOne({ where: { user: { id: userId } } });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        profile.firstName = firstName || profile.firstName;
        profile.lastName = lastName || profile.lastName;
        profile.contactNumber = contactNumber || profile.contactNumber;
        profile.email = email || profile.email;
        // Ensure address exists before updating
        if (!profile.address) {
            profile.address = new Booking_2.Address();
        }
        profile.address.street = street || profile.address.street;
        profile.address.number = number || profile.address.number;
        profile.address.city = city || profile.address.city;
        profile.address.postalCode = postalCode || profile.address.postalCode;
        await bookingRepo.save(profile);
        res.status(200).json({ message: 'Profile updated successfully', profile });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
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
const getBookingHistory = async (req, res) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string
    const { year, month } = req.query;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const queryOptions = {
            where: { user: { id: userId } },
            relations: ['user'],
        };
        if (year && month) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
            queryOptions.where = {
                ...queryOptions.where,
                createdAt: (0, typeorm_1.MoreThan)(startDate) && (0, typeorm_1.LessThan)(endDate), // Combine conditions
            };
        }
        const bookings = await bookingRepo.find(queryOptions);
        res.status(200).json({ bookings });
    }
    catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({ message: 'Error fetching booking history', error: error.message });
    }
};
exports.getBookingHistory = getBookingHistory;
const getUpcomingBookings = async (req, res) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const upcomingBookings = await bookingRepo.find({
            where: {
                user: { id: userId }, // Ensure `user` is treated as a relation
                cleaningStartDate: (0, typeorm_1.MoreThan)(new Date()),
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
