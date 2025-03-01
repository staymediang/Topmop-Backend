import axios from 'axios';
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Booking } from '../models/Booking';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

// 🔹 Initiate Paystack Payment
export const initiatePayment = async (req: Request, res: Response) => {
    const { bookingId, email, amount } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
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
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amountInKobo,
                reference: `BOOKING-${bookingId}-${Date.now()}`,
                callback_url: `https://api.topmopcleaningsolutions.co.uk/payment/callback`,
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.status) {
            // Save the payment reference in the booking record
            booking.paymentReference = response.data.data.reference;
            booking.paymentStatus = 'pending'; // Payment is pending
            await bookingRepo.save(booking);

            return res.status(200).json({
                message: 'Payment link generated',
                paymentUrl: response.data.data.authorization_url,
            });
        } else {
            throw new Error('Paystack initialization failed');
        }
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Error initiating payment', error: error.message });
    }
};

// 🔹 Verify Paystack Payment (Webhook)
export const verifyPayment = async (req: Request, res: Response) => {
    const { event, data } = req.body;

    try {
        if (event === 'charge.success') {
            const { reference, amount, customer } = data;
            const bookingRepo = AppDataSource.getRepository(Booking);

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
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};
