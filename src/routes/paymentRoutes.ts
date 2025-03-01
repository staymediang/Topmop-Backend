import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/paymentContoller';

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/webhook', verifyPayment); // Webhook for Paystack transactions

export default router;
