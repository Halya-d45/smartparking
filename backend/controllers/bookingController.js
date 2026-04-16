const Booking = require("../models/Booking");
const Parking = require("../models/Parking");

exports.createBooking = async (req, res) => {
    try {
        const { parkingId, slot, duration } = req.body;
        const userId = req.user.id;
        const parking = await Parking.findOne({ overpassId: parkingId });
        if (!parking) return res.status(404).json({ error: "Parking lot not found" });

        if (parking.availableSlots <= 0) {
            return res.status(400).json({ error: "No slots available" });
        }

        const ratePerHour = parking.pricePerHour || 0;
        const totalAmount = duration * ratePerHour;

        const booking = new Booking({
            userId,
            parkingId,
            slot,
            duration,
            ratePerHour,
            totalAmount,
            date: new Date(),
            paymentStatus: 'Awaiting Payment',
            isPaid: false
        });

        await booking.save();

        // Update availability
        parking.availableSlots -= 1;
        await parking.save();

        res.status(201).json({ message: "Booking confirmed", booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Booking failed" });
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
