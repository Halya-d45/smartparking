const User = require("../models/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, vehicles } = req.body;
        const user = await User.findById(req.user.id);
        
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (vehicles) user.vehicles = vehicles;
        
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

exports.addVehicle = async (req, res) => {
    try {
        const { model, plate, type } = req.body;
        const user = await User.findById(req.user.id);
        
        user.vehicles.push({ model, plate, type });
        await user.save();
        
        res.json({ message: "Vehicle added", vehicles: user.vehicles });
    } catch (err) {
        res.status(500).json({ error: "Failed to add vehicle" });
    }
};
