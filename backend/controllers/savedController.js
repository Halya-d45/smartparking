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

        if (!name || !location || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: "Missing metadata (coordinates/name) to save new place" });
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
        console.error("Toggle Save Error:", err);
        res.status(500).json({ error: "Failed to toggle save: " + err.message });
    }
};

exports.getSaved = async (req, res) => {
    try {
        const saved = await SavedParking.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ saved });
    } catch (err) {
        console.error("Fetch Saved Error:", err);
        res.status(500).json({ error: "Failed to fetch saved places: " + err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const mongoose = require("mongoose");
        const uId = new mongoose.Types.ObjectId(userId);
        
        // Count bookings (Try both formats for safety during transition)
        const activeBookings = await Booking.countDocuments({ 
            $or: [
                { userId: userId.toString() },
                { userId: uId }
            ]
        });

        // Count saved places
        const savedPlaces = await SavedParking.countDocuments({ 
            userId: uId
        });

        res.json({
            activeBookings: activeBookings || 0,
            savedPlaces: savedPlaces || 0
        });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats: " + err.message });
    }
};
