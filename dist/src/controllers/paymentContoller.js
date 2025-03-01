"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initiatePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../config/database");
const Booking_1 = require("../models/Booking");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
// 🔹 Initiate Paystack Payment
const initiatePayment = async (req, res) => {
    const { bookingId, email, amount } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!email || !amount) {
            return res.status(400).json({ message: 'Email and amount are required' });
        }
        // Convert amount to kobo (Paystack requires amount in kobo)
        const amountInKobo = amount * 100;
        // Call Paystack API to initialize payment
        const response = await axios_1.default.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount: amountInKobo,
            reference: `BOOKING-${bookingId}-${Date.now()}`,
            callback_url: `https://api.topmopcleaningsolutions.co.uk/payment/callback`,
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.data.status) {
            // Save the payment reference in the booking record
            booking.paymentReference = response.data.data.reference;
            booking.paymentStatus = 'pending'; // Payment is pending
            await bookingRepo.save(booking);
            return res.status(200).json({
                message: 'Payment link generated',
                paymentUrl: response.data.data.authorization_url,
            });
        }
        else {
            throw new Error('Paystack initialization failed');
        }
    }
    catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Error initiating payment', error: error.message });
    }
};
exports.initiatePayment = initiatePayment;
// 🔹 Verify Paystack Payment (Webhook)
const verifyPayment = async (req, res) => {
    const { event, data } = req.body;
    try {
        if (event === 'charge.success') {
            const { reference, amount, customer } = data;
            const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
            // Find booking by reference
            const booking = await bookingRepo.findOne({ where: { paymentReference: reference } });
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found for this transaction' });
            }
            // Confirm amount
            if (booking.amount * 100 !== amount) {
                return res.status(400).json({ message: 'Payment amount mismatch' });
            }
            // Mark booking as paid
            booking.paymentStatus = 'paid';
            await bookingRepo.save(booking);
            return res.status(200).json({ message: 'Payment verified successfully' });
        }
        res.status(400).json({ message: 'Unhandled event type' });
    }
    catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};
exports.verifyPayment = verifyPayment;
