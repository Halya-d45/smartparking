const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

router.post("/create", auth, bookingController.createBooking);
router.get("/", auth, bookingController.getUserBookings);
router.patch("/update-payment-status", auth, bookingController.updatePaymentStatus);

// Admin Routes
router.get("/admin/all", auth, bookingController.getAllAdminBookings);
router.patch("/admin/update", auth, bookingController.updateBookingAdmin);

module.exports = router;