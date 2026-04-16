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
        enum: ['Pending', 'Awaiting Payment', 'Paid', 'Confirmed', 'Failed'],
        default: 'Awaiting Payment'
    },
    isPaid: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Booking",bookingSchema);