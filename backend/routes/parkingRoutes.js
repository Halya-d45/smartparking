const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parkingController");

const auth = require("../middleware/auth");

router.get("/", parkingController.getAllParking);
router.get("/suggestions", parkingController.getSuggestions); // Add this
router.get("/:id", parkingController.getParkingById);
router.post("/sync", parkingController.syncWithOverpass);
router.post("/discover", parkingController.discoverNearby);

// Admin Routes
router.post("/admin/create", auth, parkingController.createHubAdmin);
router.delete("/admin/delete/:id", auth, parkingController.deleteHubAdmin);

module.exports = router;