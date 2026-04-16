const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parkingController");

router.get("/", parkingController.getAllParking);
router.get("/suggestions", parkingController.getSuggestions); // Add this
router.get("/:id", parkingController.getParkingById);
router.post("/sync", parkingController.syncWithOverpass);
router.post("/discover", parkingController.discoverNearby);

module.exports = router;