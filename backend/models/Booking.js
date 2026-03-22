const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parkingId: {
        type: String, // Overpass ID
        required: true
    },
    slot: String,
    duration: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking",bookingSchema);