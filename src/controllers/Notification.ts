import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await AppDataSource.getRepository(Notification).find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
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

        notification.isActive = !notification.isActive;
        await notificationRepo.save(notification);
        res.status(200).json({ message: 'Notification status updated', notification });
    } catch (error) {
        console.error("Error toggling notification:", error);
        res.status(500).json({ message: 'Error updating notification status' });
    }
};
