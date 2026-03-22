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

        const booking = new Booking({
            userId,
            parkingId,
            slot,
            duration,
            date: new Date()
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
