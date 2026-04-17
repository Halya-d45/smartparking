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
    parkingHubName: String,
    location: String,
    slot: String,
    duration: Number,
    ratePerHour: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Awaiting Payment', 'Paid', 'Confirmed', 'Failed', 'Rejected'],
        default: 'Pending'
    },
    isPaid: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Booking",bookingSchema);