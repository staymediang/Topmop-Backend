import { Request, Response } from 'express';
import { Booking, BookingStatus } from '../models/Booking';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Address } from '../models/Booking'; 



export const setFrequency = async (req: Request, res: Response) => {
    let { frequency, hoursRequired, preferredDay, preferredDays, preferredTime, userId } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const booking = new Booking();
        booking.frequency = frequency;

        // Ensure hoursRequired is a number
        booking.hoursRequired = Number(hoursRequired);

        // Handle both "preferredDay" and "preferredDays"
        if (Array.isArray(preferredDays)) {
            booking.preferredDays = preferredDays;
        } else if (Array.isArray(preferredDay)) {
            booking.preferredDays = preferredDay;
        } else {
            throw new Error('Invalid format for preferred days');
        }

        if (!preferredTime || typeof preferredTime !== 'string') {
            console.error('Invalid preferredTime:', preferredTime);
            throw new Error('Invalid preferred time format. Expected a string.');
        }
        
        console.log('Received preferredTime:', preferredTime);
        console.log('Type of preferredTime:', typeof preferredTime);

        booking.preferredTimes = preferredTime;

        // Set default values for required fields
        booking.firstName = '';
        booking.lastName = '';
        booking.contactNumber = '';
        booking.email = '';

        const address = new Address();
        address.street = '';
        address.number = '';
        address.city = '';
        address.postalCode = '';
        booking.address = address;

        booking.amount = 0.0;
        booking.user = user;
        booking.paymentType = 'pending';

        await queryRunner.manager.save(booking);
        await queryRunner.commitTransaction();

        res.status(201).json({ message: 'Frequency set', bookingId: booking.id });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error details:', error);
        res.status(500).json({ message: 'Error setting frequency', error: error.message });
    } finally {
        await queryRunner.release();
    }
};



export const setRequirements = async (req: Request, res: Response) => {
    const {
        bookingId,
        additionalInfo,         // String: Any additional information
        dirtLevel,              // Enum: Light, Medium, Heavy
        roomSelection,          // Array: Selected rooms (e.g., { room: 'Kitchen', count: 2 })
        additionalServices      // Array: Selected additional services (e.g., { service: 'Laundry', count: 1 })
    } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update booking details
        booking.additionalInfo = additionalInfo || null;         // Optional field
        booking.dirtLevel = dirtLevel;                           // Validate against allowed values (Light, Medium, Heavy)
        booking.roomSelection = roomSelection || [];             // Store selected rooms
        booking.additionalServices = additionalServices || [];   // Store selected additional services

        await bookingRepo.save(booking);
        res.status(200).json({
            message: 'Requirements set successfully',
            bookingId: booking.id,
            summary: {
                additionalInfo: booking.additionalInfo,
                dirtLevel: booking.dirtLevel,
                roomSelection: booking.roomSelection,
                additionalServices: booking.additionalServices,
            }
        });
    } catch (error) {
        console.error("Error setting requirements:", error);
        res.status(500).json({ message: 'Error setting requirements', error: error.message });
    }
};



export const setPersonalDetails = async (req: Request, res: Response) => {
    const { bookingId, title, firstName, lastName, contactNumber, email, address } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId }, relations: ['address'] });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!title || !firstName || !lastName || !contactNumber || !email || !address || 
            !address.street || !address.number || !address.city || !address.postalCode) {
            return res.status(400).json({ message: 'All personal details are required' });
        }

        booking.title = title;
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;

        if (!booking.address) {
            booking.address = new Address();
        }
        booking.address.street = address.street;
        booking.address.number = address.number;
        booking.address.city = address.city;
        booking.address.postalCode = address.postalCode;

        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details updated successfully' });
    } catch (error) {
        console.error("Error updating personal details:", error);
        res.status(500).json({ message: 'Error updating personal details', error: error.message });
    }
};



export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Ensure this is treated as a string
        const bookingRepo = AppDataSource.getRepository(Booking);

        const profile = await bookingRepo.findOne({ where: { user: { id: userId } } });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const { firstName, lastName, email, contactNumber, address } = profile;
        const { street, number, city, postalCode } = address || {}; // Handle missing address

        res.status(200).json({ 
            firstName, 
            lastName, 
            email, 
            contactNumber, 
            address: { street, number, city, postalCode } 
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
export const updateProfile = async (req: Request, res: Response) => {
    const { firstName, lastName, contactNumber, email, address } = req.body;
    const { street, number, city, postalCode } = address || {};

    try {
        const userId = req.user?.userId;
        const bookingRepo = AppDataSource.getRepository(Booking);

        const profile = await bookingRepo.findOne({ where: { user: { id: userId } } });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        profile.firstName = firstName || profile.firstName;
        profile.lastName = lastName || profile.lastName;
        profile.contactNumber = contactNumber || profile.contactNumber;
        profile.email = email || profile.email;

        // **Explicitly create a new Address object**
        profile.address = {
            street: street || profile.address?.street,
            number: number || profile.address?.number,
            city: city || profile.address?.city,
            postalCode: postalCode || profile.address?.postalCode,
        };

        // Save the updated profile
        await bookingRepo.save(profile);

        res.status(200).json({ message: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};

export const getBookingDetails = async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ booking });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: 'Error fetching booking details', error: error.message });
    }
};

export const getUserBookingHistory = async (req: Request, res: Response) => {
    const userId = req.user?.userId?.toString(); // Extract user ID from authenticated request

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        
        // Fetch all bookings for this user
        const bookings = await bookingRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: "DESC" }, // Sort by latest bookings first
            relations: ["user"], // Include user details
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No booking history found for this user" });
        }

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error fetching user booking history:", error);
        res.status(500).json({ message: "Error fetching booking history", error: error.message });
    }
};

export const getUpcomingBookings = async (req: Request, res: Response) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const upcomingBookings = await bookingRepo.find({
            where: {
                user: { id: userId }, // Ensure `user` is treated as a relation
                cleaningStartDate: MoreThanOrEqual(new Date()),
            },
            relations: ['user'], // Include related user data
        });

        res.status(200).json({ upcomingBookings });
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        res.status(500).json({ message: 'Error fetching upcoming bookings', error: error.message });
    }
};

// Get Booking Summary
export const getBookingSummary = async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({
            frequency: booking.frequency,
            hoursRequired: booking.hoursRequired,
            preferredDay: booking.preferredDays,
            preferredTime: booking.preferredTimes,
            cleaningStartDate: booking.cleaningStartDate,
            needsIroning: booking.needsIroning,
            accessInstructions: booking.accessInstructions,
            additionalInfo: booking.additionalInfo,
            referralSource: booking.referralSource,
            paymentType: booking.paymentType,
            amount: booking.amount,
            createdAt: booking.createdAt,
        });
    } catch (error) {
        console.error("Error fetching booking summary:", error);
        res.status(500).json({ message: 'Error fetching booking summary', error: error.message });
    }
};


// Admin: Cancel Booking
export const cancelBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = BookingStatus.CANCELLED; // Update status to "cancelled"
        await bookingRepo.save(booking);

        res.status(200).json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
};

// Admin: Get Ongoing Bookings
export const getOngoingBookings = async (req: Request, res: Response) => {
    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const ongoingBookings = await bookingRepo.find({
            where: { status: BookingStatus.ONGOING },
            relations: ['user'],
        });

        res.status(200).json({ ongoingBookings });
    } catch (error) {
        console.error("Error fetching ongoing bookings:", error);
        res.status(500).json({ message: 'Error fetching ongoing bookings', error: error.message });
    }
};

// Admin: Get Completed Bookings
export const getCompletedBookings = async (req: Request, res: Response) => {
    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const completedBookings = await bookingRepo.find({
            where: { status: BookingStatus.COMPLETED },
            relations: ['user'],
        });

        res.status(200).json({ completedBookings });
    } catch (error) {
        console.error("Error fetching completed bookings:", error);
        res.status(500).json({ message: 'Error fetching completed bookings', error: error.message });
    }
};

// Admin: Get New Bookings
export const getNewBookings = async (req: Request, res: Response) => {
    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const newBookings = await bookingRepo.find({
            where: { status: BookingStatus.NEW },
            relations: ['user'],
        });

        res.status(200).json({ newBookings });
    } catch (error) {
        console.error("Error fetching new bookings:", error);
        res.status(500).json({ message: 'Error fetching new bookings', error: error.message });
    }
};

// Admin: Get All Bookings
export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const bookings = await bookingRepo.find({
            relations: ['user'], // Include related entities like user if necessary
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};