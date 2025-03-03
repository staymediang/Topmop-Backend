import Stripe from 'stripe';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking } from '../models/Booking';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(STRIPE_SECRET_KEY,);

// 🔹 Initiate Stripe Payment
export const initiatePayment = async (req: Request, res: Response) => {
    const { bookingId, email, amount, currency } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
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

    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Error initiating payment', error: error.message });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook error: ${err.message}` });
    }

    const bookingRepo = AppDataSource.getRepository(Booking);

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        const booking = await bookingRepo.findOne({ where: { paymentReference: paymentIntent.id } });

        if (!booking) {
            console.warn(`Booking not found for paymentReference: ${paymentIntent.id}`);
            return res.status(404).json({ message: 'Booking not found for this transaction' });
        }

        // Mark booking as paid
        booking.paymentStatus = 'paid';
        await bookingRepo.save(booking);

        console.log(`Payment verified for booking: ${booking.id}`);

        return res.status(200).json({ message: 'Payment verified successfully' });
    }

    if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;

        const booking = await bookingRepo.findOne({ where: { paymentReference: paymentIntent.id } });

        if (booking) {
            booking.paymentStatus = 'failed';
            await bookingRepo.save(booking);
        }

        console.error(`Payment failed for booking: ${booking?.id || 'Unknown'}`);
        return res.status(400).json({ message: 'Payment failed' });
    }

    console.warn(`Unhandled event type: ${event.type}`);
    res.status(400).json({ message: 'Unhandled event type' });
};
