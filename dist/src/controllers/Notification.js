"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editNotification = exports.deleteNotification = exports.toggleNotification = exports.createNotification = exports.getNotifications = void 0;
const database_1 = require("../config/database");
const Notification_1 = require("../models/Notification");
const getNotifications = async (req, res) => {
    try {
        const notifications = await database_1.AppDataSource.getRepository(Notification_1.Notification).find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};
exports.getNotifications = getNotifications;
const createNotification = async (req, res) => {
    const { title, message, isActive } = req.body;
    try {
        const notification = new Notification_1.Notification();
        notification.title = title;
        notification.message = message;
        notification.isActive = isActive !== undefined ? isActive : true;
        console.log("Saving notification:", notification);
        await database_1.AppDataSource.getRepository(Notification_1.Notification).save(notification);
        console.log("Notification saved successfully");
        res.status(201).json({ message: 'Notification created successfully' });
    }
    catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ message: 'Error creating notification' });
    }
};
exports.createNotification = createNotification;
const toggleNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const notificationRepo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const notification = await notificationRepo.findOne({ where: { id: parseInt(id) } });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.isActive = !notification.isActive;
        await notificationRepo.save(notification);
        res.status(200).json({ message: 'Notification status updated', notification });
    }
    catch (error) {
        console.error("Error toggling notification:", error);
        res.status(500).json({ message: 'Error updating notification status' });
    }
};
exports.toggleNotification = toggleNotification;
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const notificationRepo = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const notification = await notificationRepo.findOne({ where: { id: parseInt(id) } });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await notificationRepo.remove(notification);
        res.status(200).json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
};
exports.deleteNotification = deleteNotification;
const editNotification = async (req, res) => {
    const { id } = req.params; // Notification ID
    const { title, message, isActive } = req.body; // Fields to update
    try {
        const notificationRepo = database_1.AppDataSource.getRepository(Notification_1.Notification);
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
    }
    catch (error) {
        console.error("Error updating notification:", error);
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
};
exports.editNotification = editNotification;
