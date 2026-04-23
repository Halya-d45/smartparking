const express = require("express");
const { sendMessage, getUserMessages, getAllMessages, replyMessage } = require("../controllers/messageController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/user", auth, getUserMessages);
router.get("/admin", auth, getAllMessages);
router.patch("/:id/reply", auth, replyMessage);

module.exports = router;
