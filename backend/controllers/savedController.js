const SavedParking = require("../models/SavedParking");
const Booking = require("../models/Booking");

exports.toggleSave = async (req, res) => {
    try {
        const { parkingId, name, location, latitude, longitude } = req.body;
        const userId = req.user.id;

        const existing = await SavedParking.findOne({ userId, parkingId });

        if (existing) {
            await SavedParking.deleteOne({ _id: existing._id });
            return res.json({ saved: false, message: "Removed from saved places" });
        }

        const newSaved = new SavedParking({
            userId,
            parkingId,
            name,
            location,
            latitude,
            longitude
        });

        await newSaved.save();
        res.status(201).json({ saved: true, message: "Added to saved places" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to toggle save" });
    }
};

exports.getSaved = async (req, res) => {
    try {
        const saved = await SavedParking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(saved);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch saved places" });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const activeBookings = await Booking.countDocuments({ 
            userId, 
            status: "confirmed" // Assuming active means confirmed
        });
        const savedPlaces = await SavedParking.countDocuments({ userId });

        res.json({
            activeBookings,
            savedPlaces
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};
