import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { MoreThan, LessThan } from 'typeorm';

export const setFrequency = async (req: Request, res: Response) => {
    const { frequency, hoursRequired, preferredDay, preferredTime } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const booking = new Booking();
        booking.frequency = frequency;
        booking.hoursRequired = hoursRequired;
        booking.preferredDay = preferredDay;
        booking.preferredTime = preferredTime;

        // Set default values for other required fields
        booking.firstName = '';
        booking.lastName = '';
        booking.contactNumber = '';
        booking.email = '';
        booking.address = {
            street: '',
            number: '',
            city: '',
            postalCode: '',
        }; // Default empty address structure
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
        meetCleanerFirst,       // Boolean: Whether the client wants to meet the cleaner
        cleaningStartDate,      // Date: Start date for the cleaning service
        needsIroning,           // Boolean: Whether ironing is needed
        accessInstructions,     // String: Instructions for accessing the property
        additionalInfo,         // String: Any additional information
        referralSource,         // String: How the client heard about the service
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
        booking.meetCleanerFirst = !!meetCleanerFirst; // Convert to boolean
        booking.cleaningStartDate = cleaningStartDate ? new Date(cleaningStartDate) : null; // Ensure Date type
        booking.needsIroning = !!needsIroning;
        booking.accessInstructions = accessInstructions || null; // Optional field
        booking.additionalInfo = additionalInfo || null;         // Optional field
        booking.referralSource = referralSource || null;         // Optional field
        booking.dirtLevel = dirtLevel;                           // Validate against allowed values (Light, Medium, Heavy)
        booking.roomSelection = roomSelection || [];             // Store selected rooms
        booking.additionalServices = additionalServices || [];   // Store selected additional services

        await bookingRepo.save(booking);
        res.status(200).json({
            message: 'Requirements set successfully',
            bookingId: booking.id,
            summary: {
                meetCleanerFirst: booking.meetCleanerFirst,
                cleaningStartDate: booking.cleaningStartDate,
                needsIroning: booking.needsIroning,
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
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (
            !title ||
            !firstName ||
            !lastName ||
            !contactNumber ||
            !email ||
            !address ||
            !address.street ||
            !address.number ||
            !address.city ||
            !address.postalCode
        ) {
            return res.status(400).json({ message: 'All personal details are required' });
        }

        booking.title = title;
        booking.firstName = firstName;
        booking.lastName = lastName;
        booking.contactNumber = contactNumber;
        booking.email = email;
        booking.address = {
            street: address.street,
            number: address.number,
            city: address.city,
            postalCode: address.postalCode,
        };

        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Personal details updated successfully' });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error updating personal details', error: error.message });
    }
};

export const setPaymentDetails = async (req: Request, res: Response) => {
    const { bookingId, paymentType, amount } = req.body;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Debugging statement to check if booking has all personal details
        console.log("Retrieved booking details:", {
            firstName: booking.firstName,
            lastName: booking.lastName,
            contactNumber: booking.contactNumber,
            email: booking.email,
            address: booking.address,
            city: booking.city,
            postalCode: booking.postalCode,
        });

        // Check for required personal details
        const missingFields = [];
        if (!booking.firstName) missingFields.push('firstName');
        if (!booking.lastName) missingFields.push('lastName');
        if (!booking.contactNumber) missingFields.push('contactNumber');
        if (!booking.email) missingFields.push('email');
        if (!booking.address) missingFields.push('address');
        if (!booking.city) missingFields.push('city');

        if (missingFields.length > 0) {
            console.error("Missing fields in booking details:", missingFields);
            return res.status(400).json({
                message: `Missing required personal details: ${missingFields.join(', ')}`,
            });
        }

        // Debugging statement before setting payment details
        console.log("All required personal details are present. Proceeding to set payment details.");

        // Proceed with setting payment details
        booking.paymentType = paymentType;
        booking.amount = amount;

        await bookingRepo.save(booking);
        res.status(200).json({ message: 'Payment details set. Booking complete.', booking });
    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ message: 'Error setting payment details', error: error.message });
    }
};


export const getProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId; // Ensure this is treated as a string
      const bookingRepo = AppDataSource.getRepository(Booking);
  
      const profile = await bookingRepo.findOne({ where: { user: { id: userId } } }); // Use the relation properly
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      const { firstName, lastName, email, contactNumber, address, city, postalCode } = profile;
      res.status(200).json({ firstName, lastName, email, contactNumber, address, city, postalCode });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
  };
  
  export const updateProfile = async (req: Request, res: Response) => {
    const { firstName, lastName, contactNumber, email, address, city, postalCode } = req.body;
  
    try {
      const userId = req.user?.userId;
      const bookingRepo = AppDataSource.getRepository(Booking);
  
      const profile = await bookingRepo.findOne({ where: { user: { id: userId } } }); // Use the relation properly
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      profile.firstName = firstName || profile.firstName;
      profile.lastName = lastName || profile.lastName;
      profile.contactNumber = contactNumber || profile.contactNumber;
      profile.email = email || profile.email;
      profile.address = address || profile.address;
      profile.city = city || profile.city;
      profile.postalCode = postalCode || profile.postalCode;
  
      await bookingRepo.save(profile);
      res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: 'Error updating profile', error: error.message });
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

export const getBookingHistory = async (req: Request, res: Response) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string
    const { year, month } = req.query;

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);

        const queryOptions: any = {
            where: { user: { id: userId } },
            relations: ['user'],
        };

        if (year && month) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
        
            queryOptions.where = {
                ...queryOptions.where,
                createdAt: MoreThan(startDate) && LessThan(endDate), // Combine conditions
            };
        }
        

        const bookings = await bookingRepo.find(queryOptions);

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({ message: 'Error fetching booking history', error: error.message });
    }
};



export const getUpcomingBookings = async (req: Request, res: Response) => {
    const userId = req.user?.userId?.toString(); // Ensure it's a string

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const upcomingBookings = await bookingRepo.find({
            where: {
                user: { id: userId }, // Ensure `user` is treated as a relation
                cleaningStartDate: MoreThan(new Date()),
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
            preferredDay: booking.preferredDay,
            preferredTime: booking.preferredTime,
            meetCleanerFirst: booking.meetCleanerFirst,
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

        await bookingRepo.remove(booking);
        res.status(200).json({ message: 'Booking cancelled successfully' });
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
            where: { cleaningStartDate: LessThan(new Date()), paymentType: 'pending' }, // Assuming "pending" means ongoing
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
            where: { paymentType: 'completed' }, // Assuming "completed" status
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
            where: { paymentType: 'pending' }, // Pending bookings
            relations: ['user'],
        });

        res.status(200).json({ newBookings });
    } catch (error) {
        console.error("Error fetching new bookings:", error);
        res.status(500).json({ message: 'Error fetching new bookings', error: error.message });
    }
};

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

