import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
    const { isActive } = req.query; // Optional query parameter to filter active/inactive notifications

    try {
        const notificationRepo = AppDataSource.getRepository(Notification);

        // Determine filtering criteria based on `isActive` query parameter
        const whereClause = isActive !== undefined ? { isActive: isActive === 'true' } : {};

        const notifications = await notificationRepo.find({
            where: whereClause,
            order: { createdAt: 'DESC' },
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};


export const createNotification = async (req: Request, res: Response) => {
    const { title, message, isActive } = req.body;

    try {
        const notification = new Notification();
        notification.title = title;
        notification.message = message;
        notification.isActive = isActive !== undefined ? isActive : true;

        console.log("Saving notification:", notification);
        await AppDataSource.getRepository(Notification).save(notification);
        console.log("Notification saved successfully");
        res.status(201).json({ message: 'Notification created successfully' });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: 'Error creating notification' });
    }
};

export const toggleNotification = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const notificationRepo = AppDataSource.getRepository(Notification);
        const notification = await notificationRepo.findOne({ where: { id: parseInt(id) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Toggle the `isActive` status
        notification.isActive = false;
        await notificationRepo.save(notification);

        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error toggling notification:', error);
        res.status(500).json({ message: 'Error updating notification status' });
    }
};


export const deleteNotification = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const notificationRepo = AppDataSource.getRepository(Notification);
        const notification = await notificationRepo.findOne({ where: { id: parseInt(id) } });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notificationRepo.remove(notification);
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
};


export const editNotification = async (req: Request, res: Response) => {
    const { id } = req.params; // Notification ID
    const { title, message, isActive } = req.body; // Fields to update
  
    try {
      const notificationRepo = AppDataSource.getRepository(Notification);
  
      // Fetch the notification by ID
      const notification = await notificationRepo.findOne({ where: { id: parseInt(id) } });
  
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
  
      // If no fields to update, return the notification for prefill
      if (!title && !message && isActive === undefined) {
        return res.status(200).json({ notification });
      }
  
      // Update allowed fields only
      notification.title = title || notification.title;
      notification.message = message || notification.message;
      if (isActive !== undefined) {
        notification.isActive = isActive;
      }
  
      // Save the updated notification
      await notificationRepo.save(notification);
  
      res.status(200).json({ message: "Notification updated successfully", notification });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Error updating notification", error: error.message });
    }
  };
  