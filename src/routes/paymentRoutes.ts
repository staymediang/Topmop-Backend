import express from 'express';
import { initiatePayment, verifyPayment } from '../controllers/paymentContoller';
import bodyParser from 'body-parser';

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), verifyPayment); // Correct setup

export default router;
