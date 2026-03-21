const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({

name: String,
    overpassId: { type: String, unique: true },
    location: String,
    latitude: Number,
    longitude: Number,
    totalSlots: { type: Number, default: 10 },
    availableSlots: { type: Number, default: 10 },
    pricePerHour: { type: Number, default: 2.5 },
    image: String

});

module.exports = mongoose.model("Parking",parkingSchema);