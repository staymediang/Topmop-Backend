"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initiatePayment = void 0;
const stripe_1 = __importDefault(require("stripe"));
const database_1 = require("../config/database");
const Booking_1 = require("../models/Booking");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new stripe_1.default(STRIPE_SECRET_KEY);
// 🔹 Initiate Stripe Payment
const initiatePayment = async (req, res) => {
    const { bookingId, email, amount, currency } = req.body;
    try {
        const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!email || !amount || !currency) {
            return res.status(400).json({ message: 'Email, amount, and currency are required' });
        }
        // Ensure currency is in lowercase (Stripe requires lowercase)
        const formattedCurrency = currency.toLowerCase();
        // Create a Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: formattedCurrency,
            payment_method_types: ['card'],
            metadata: { bookingId: bookingId.toString(), email },
        });
        // Save the payment intent ID in the booking record
        booking.paymentReference = paymentIntent.id;
        booking.paymentStatus = 'pending';
        await bookingRepo.save(booking);
        res.status(200).json({
            message: 'Payment initiated',
            clientSecret: paymentIntent.client_secret, // Needed for frontend
        });
    }
    catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Error initiating payment', error: error.message });
    }
};
exports.initiatePayment = initiatePayment;
const verifyPayment = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    if (!STRIPE_WEBHOOK_SECRET) {
        console.error("Missing STRIPE_WEBHOOK_SECRET in environment variables.");
        return res.status(500).json({ message: "Internal server error" });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook error: ${err.message}` });
    }
    const paymentIntent = event.data.object;
    const bookingRepo = database_1.AppDataSource.getRepository(Booking_1.Booking);
    const booking = await bookingRepo.findOne({ where: { paymentReference: paymentIntent.id } });
    if (!booking) {
        console.warn(`Booking not found for paymentReference: ${paymentIntent.id}`);
        return res.status(404).json({ message: 'Booking not found for this transaction' });
    }
    switch (event.type) {
        case 'payment_intent.succeeded':
            booking.paymentStatus = 'paid';
            console.log(`✅ Payment verified for booking: ${booking.id}`);
            break;
        case 'payment_intent.payment_failed':
            booking.paymentStatus = 'failed';
            console.error(`❌ Payment failed for booking: ${booking.id}`);
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
            return res.status(400).json({ message: 'Unhandled event type' });
    }
    await bookingRepo.save(booking);
    return res.status(200).json({ message: 'Webhook processed' });
};
exports.verifyPayment = verifyPayment;
