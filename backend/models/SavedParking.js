const mongoose = require("mongoose");

const savedParkingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parkingId: {
        type: String, // Overpass ID
        required: true
    },
    name: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only save a specific parking once
savedParkingSchema.index({ userId: 1, parkingId: 1 }, { unique: true });

module.exports = mongoose.model("SavedParking", savedParkingSchema);
