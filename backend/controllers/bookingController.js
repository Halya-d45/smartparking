const Booking = require("../models/Booking");
const Parking = require("../models/Parking");

exports.createBooking = async (req, res) => {
    try {
        const { parkingId, slot, duration, parkingName, location, pricePerHour } = req.body;
        const userId = req.user.id;

        // Try to find existing parking
        let parking = await Parking.findOne({ overpassId: parkingId });

        // If not found (dynamic hub), create it on the fly
        if (!parking) {
            let parsedPrice = 5.0;
            if (pricePerHour) {
                parsedPrice = parseFloat(String(pricePerHour).replace(/[^\d.]/g, '')) || 5.0;
            }
            
            parking = new Parking({
                overpassId: parkingId || ("MOCK-" + Math.random().toString(36).substr(2, 5)),
                name: parkingName || "Public Parking",
                location: location || "City Center",
                pricePerHour: parsedPrice,
                totalSlots: 50,
                availableSlots: 49
            });
            await parking.save();
        }

        if (parking.availableSlots <= 0) {
            return res.status(400).json({ error: "No slots available" });
        }

        const ratePerHour = parking.pricePerHour || 0;
        const totalAmount = (duration || 2) * ratePerHour;

        const booking = new Booking({
            userId,
            parkingId: parking.overpassId || parkingId, // Use the ID from the created/found parking record
            parkingHubName: parkingName || parking.name || "Public Parking",
            location: location || parking.location || "City Center",
            slot: slot || "A-1",
            duration: parseInt(duration) || 2,
            ratePerHour,
            totalAmount,
            date: new Date(),
            paymentStatus: 'Confirmed',
            isPaid: true
        });

        await booking.save();

        // Update availability
        parking.availableSlots -= 1;
        await parking.save();

        res.status(201).json({ message: "Booking confirmed", booking });
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ error: "Booking failed: " + err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).sort({ date: -1 });
        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { bookingId, paymentStatus, isPaid } = req.body;

        if (!bookingId || typeof isPaid !== 'boolean') {
            return res.status(400).json({ error: 'bookingId and isPaid are required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.paymentStatus = paymentStatus || (isPaid ? 'Confirmed' : 'Pending');
        booking.isPaid = isPaid;

        await booking.save();

        res.json({ message: 'Booking payment status updated', booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update payment status failed' });
    }
};

// Admin Functions
exports.getAllAdminBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('userId', 'name email').sort({ date: -1 });
        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ error: "Fetch admin bookings failed" });
    }
};

exports.updateBookingAdmin = async (req, res) => {
    try {
        const { bookingId, action } = req.body; // action = 'accept' or 'decline'
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (action === 'accept') {
            booking.paymentStatus = 'Confirmed';
        } else if (action === 'decline') {
            booking.paymentStatus = 'Rejected';
        }
        await booking.save();
        res.json({ message: `Booking ${action}ed successfully`, booking });
    } catch (err) {
        res.status(500).json({ error: "Admin update failed" });
    }
};
