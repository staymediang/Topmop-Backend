import express from 'express';
import { getNotifications, createNotification, toggleNotification } from '../controllers/Notification';

const router = express.Router();

// Get notifications
 router.get('/', getNotifications);

 // Create a new notification
 router.post('/', createNotification);

 // Toggle the status of a notification
 router.put('/:id', toggleNotification);

export default router;
