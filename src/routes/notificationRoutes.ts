import express from 'express';
import { getNotifications, createNotification, toggleNotification, deleteNotification, editNotification } from '../controllers/Notification';

const router = express.Router();

// Get notifications
 router.get('/', getNotifications);

 // Create a new notification
 router.post('/', createNotification);

 // Toggle the status of a notification
 router.put('/:id', toggleNotification);

 // Delete a notification
router.delete('/:id', deleteNotification);

// Edit a notification
router.put('/edit/:id', editNotification);

export default router;
