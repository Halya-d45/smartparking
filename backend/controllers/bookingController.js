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
            parking = new Parking({
                overpassId: parkingId,
                name: parkingName || "Public Parking",
                location: location || "City Center",
                pricePerHour: parseFloat(pricePerHour.replace('$','')) || 5.0,
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
            parkingId,
            slot: slot || "A-1",
            duration: duration || 2,
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
        const bookings = await Booking.find({ userId: req.query.userId });
        res.json(bookings);
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
