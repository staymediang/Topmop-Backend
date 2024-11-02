import express from 'express';
import { setFrequency, setRequirements, setPersonalDetails, setPaymentDetails } from '../../controllers/bookingController';

const router = express.Router();

router.post('/frequency', setFrequency);
router.post('/requirements', setRequirements);
router.post('/personal-details', setPersonalDetails);
router.post('/payment', setPaymentDetails);

export default router;
