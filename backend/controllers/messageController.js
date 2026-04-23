const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { subject, content } = req.body;
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    const newMessage = new Message({
      userId: req.user.id,
      userName: user ? user.name : "User",
      subject,
      content
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    message.reply = reply;
    message.status = "replied";

    await message.save();
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
