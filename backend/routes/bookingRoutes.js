const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const auth = require("../middleware/auth");

router.post("/create", auth, bookingController.createBooking);
router.get("/", auth, bookingController.getUserBookings);
router.patch("/update-payment-status", auth, bookingController.updatePaymentStatus);

module.exports = router;