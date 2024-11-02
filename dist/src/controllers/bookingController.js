"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPaymentDetails = exports.setPersonalDetails = exports.setRequirements = exports.setFrequency = void 0;
const Booking_1 = require("../models/Booking");
const database_1 = require("../config/database");
const setFrequency = async (req, res) => {
    const { frequency, hoursRequired, preferredDay, preferredTime } = req.body;
    const queryRunner = database_1.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const booking = new Booking_1.Booking();
        booking.frequency = frequency;
        booking.hoursRequired = hoursRequired;
        booking.preferredDay = preferredDay;
        booking.preferredTime = preferredTime;
        // Set default values for other required fields
        booking.firstName = '';
        booking.lastName = '';
        booking.contactNumber = '';
        booking.email = '';
        booking.address = '';
        booking.city = '';
        booking.paymentType = 'pending';
        await queryRunner.manager.save(booking);
        await queryRunner.commitTransaction();
        res.status(201).json({ message: 'Frequency set', bookingId: booking.id });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error setting frequency', error: error.message });
    }
    finally {
        await queryRunner.release();
    }
};
exports.setFrequency = setFrequency;
const setRequirements = async (req, res) => {
    const { bookingId, meetCleanerFirst, cleaningStartDate, needsIroning, accessInstructions, additionalInfo, referralSource } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.meetCleanerFirst = meetCleanerFirst;
        booking.cleaningStartDate = cleaningStartDate;
        booking.needsIroning = needsIroning;
        booking.accessInstructions = accessInstructions;
        booking.additionalInfo = additionalInfo;
        booking.referralSource = referralSource;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Requirements set' });
    }
    catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error setting requirements', error: error.message });
    }
};
exports.setRequirements = setRequirements;
const setPersonalDetails = async (req, res) => {
    const { bookingId, firstName, lastName, contactNumber, email, address, city, postalCode } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!firstName || !lastName || !contactNumber || !email || !address || !city) {
            return res.status(400).json({ message: 'All personal details are required' });
        }
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;
        booking.address = address;
        booking.city = city;
        booking.postalCode = postalCode;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details set' });
    }
    catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error setting personal details', error: error.message });
    }
};
exports.setPersonalDetails = setPersonalDetails;
const setPaymentDetails = async (req, res) => {
    const { bookingId, paymentType, amount } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        console.log("Retrieved booking details:", {
            firstName: booking.firstName,
            lastName: booking.lastName,
            contactNumber: booking.contactNumber,
            email: booking.email,
            address: booking.address,
            city: booking.city,
            postalCode: booking.postalCode,
        });
        // <-- Add this line for debugging
        // Check for required personal details
        const missingFields = [];
        if (!booking.firstName)
            missingFields.push('firstName');
        if (!booking.lastName)
            missingFields.push('lastName');
        if (!booking.contactNumber)
            missingFields.push('contactNumber');
        if (!booking.email)
            missingFields.push('email');
        if (!booking.address)
            missingFields.push('address');
        if (!booking.city)
            missingFields.push('city');
        if (!booking.postalCode)
            missingFields.push('postalCode');
        if (missingFields.length > 0) {
            console.error("Missing fields in booking details:", missingFields);
            return res.status(400).json({
                message: `Missing required personal details: ${missingFields.join(', ')}`,
            });
        }
        // Proceed with setting payment details
        booking.paymentType = paymentType;
        booking.amount = amount;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Payment details set. Booking complete.', booking });
    }
    catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error setting payment details', error: error.message });
    }
};
exports.setPaymentDetails = setPaymentDetails;
