const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');

exports.createPayment = async (req, res) => {
    try {
        const { bookingId, parkingLot, slotNumber, amount, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!bookingId || !parkingLot || !slotNumber || !amount || !paymentMethod) {
            return res.status(400).json({ error: 'All payment fields are required' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        const payment = new Payment({
            userId,
            bookingId,
            parkingLot,
            slotNumber,
            amount,
            paymentMethod,
            paymentStatus: 'Pending',
            transactionId: uuidv4(),
        });

        await payment.save();

        return res.status(201).json({ message: 'Payment created', payment });
    } catch (error) {
        console.error('createPayment error', error);
        return res.status(500).json({ error: 'Unable to create payment' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { transactionId, success } = req.body;

        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID required' });
        }

        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        payment.paymentStatus = success ? 'Success' : 'Failed';
        await payment.save();

        if (payment.bookingId) {
            const booking = await Booking.findById(payment.bookingId);
            if (booking) {
                booking.isPaid = success;
                booking.paymentStatus = success ? 'Confirmed' : 'Pending';
                await booking.save();
            }
        }

        return res.json({ message: 'Payment status updated', payment });
    } catch (error) {
        console.error('verifyPayment error', error);
        return res.status(500).json({ error: 'Unable to verify payment' });
    }
};

exports.getUserPayments = async (req, res) => {
    try {
        const userId = req.params.userId || req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const payments = await Payment.find({ userId }).sort({ timestamp: -1 });
        return res.json({ payments });
    } catch (error) {
        console.error('getUserPayments error', error);
        return res.status(500).json({ error: 'Unable to fetch payment history' });
    }
};