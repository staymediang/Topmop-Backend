import { Request, Response } from 'express';
import { Booking, BookingStatus } from '../models/Booking';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Address } from '../models/Booking'; 



export const setBookingPreferences = async (req: Request, res: Response) => {
    const {
        userId,
        frequency,
        accessType,
        cleaningDate,
        cleaningTime,
    } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
        if (!user) throw new Error('User not found');

        const booking = new Booking();
        booking.user = user;
        booking.frequency = frequency;
        booking.accessType = accessType;
        booking.cleaningDate = new Date(cleaningDate);
        booking.cleaningTime = cleaningTime;

        booking.amount = 0.0; // Default, to be calculated later
        booking.paymentType = 'pending';

        // Default empty fields for now
        booking.address = new Address();
        booking.hoursRequired = 0;

        await queryRunner.manager.save(booking);
        await queryRunner.commitTransaction();

        res.status(201).json({ message: 'Booking preferences set', bookingId: booking.id });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        res.status(500).json({ message: 'Failed to set preferences', error: error.message });
    } finally {
        await queryRunner.release();
    }
};


export const setApartmentDetails = async (req: Request, res: Response) => {
    const { bookingId, apartmentType, toilets, kitchens, livingRooms, bedrooms } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.apartmentType = apartmentType;
        booking.roomDetails = {
            toilets,
            kitchens,
            livingRooms,
            bedrooms,
        };

        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Apartment details saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to save apartment details', error: error.message });
    }
};



export const setPersonalDetails = async (req: Request, res: Response) => {
    const {
        bookingId,
        title,
        firstName,
        lastName,
        contactNumber,
        email,
        city,
        street,
        number,
        postalCode,
    } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.title = title;
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;

        booking.address = {
            street,
            number,
            city,
            postalCode,
        };

        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to save personal details', error: error.message });
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