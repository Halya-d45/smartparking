const express = require("express");
const router = express.Router();
const savedController = require("../controllers/savedController");
const auth = require("../middleware/auth"); // Assuming JWT auth middleware exists

router.post("/toggle", auth, savedController.toggleSave);
router.get("/", auth, savedController.getSaved);
router.get("/stats", auth, savedController.getStats);

module.exports = router;
