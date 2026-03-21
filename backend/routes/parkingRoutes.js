const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parkingController");

router.get("/", parkingController.getAllParking);
router.get("/:id", parkingController.getParkingById);
router.post("/sync", parkingController.syncWithOverpass);

module.exports = router;