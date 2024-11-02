"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPaymentDetails = exports.setPersonalDetails = exports.setRequirements = exports.setFrequency = void 0;
const Booking_1 = require("../models/Booking");
const typeorm_1 = require("typeorm");
const setFrequency = async (req, res) => {
    const { frequency, hoursRequired, preferredDay, preferredTime } = req.body;
    try {
        const booking = new Booking_1.Booking();
        booking.frequency = frequency;
        booking.hoursRequired = hoursRequired;
        booking.preferredDay = preferredDay;
        booking.preferredTime = preferredTime;
        await (0, typeorm_1.getRepository)(Booking_1.Booking).save(booking);
        res.status(201).json({ message: 'Frequency set', bookingId: booking.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error setting frequency', error });
    }
};
exports.setFrequency = setFrequency;
const setRequirements = async (req, res) => {
    const { bookingId, meetCleanerFirst, cleaningStartDate, needsIroning, accessInstructions, additionalInfo, referralSource } = req.body;
    try {
        const bookingRepo = (0, typeorm_1.getRepository)(Booking_1.Booking);
        const booking = await bookingRepo.findOne(bookingId);
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
        res.status(500).json({ message: 'Error setting requirements', error });
    }
};
exports.setRequirements = setRequirements;
const setPersonalDetails = async (req, res) => {
    const { bookingId, firstName, lastName, contactNumber, email, address, city, postalCode } = req.body;
    try {
        const bookingRepo = (0, typeorm_1.getRepository)(Booking_1.Booking);
        const booking = await bookingRepo.findOne(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
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
        res.status(500).json({ message: 'Error setting personal details', error });
    }
};
exports.setPersonalDetails = setPersonalDetails;
const setPaymentDetails = async (req, res) => {
    const { bookingId, paymentType, amount } = req.body;
    try {
        const bookingRepo = (0, typeorm_1.getRepository)(Booking_1.Booking);
        const booking = await bookingRepo.findOne(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.paymentType = paymentType;
        booking.amount = amount;
        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Payment details set. Booking complete.', booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Error setting payment details', error });
    }
};
exports.setPaymentDetails = setPaymentDetails;
