const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    parkingLot: { type: String, required: true },
    slotNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'NetBanking'], required: true },
    paymentStatus: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' },
    transactionId: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);