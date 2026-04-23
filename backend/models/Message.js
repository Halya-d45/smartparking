const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  reply: { type: String, default: "" },
  status: { type: String, enum: ["pending", "replied"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
