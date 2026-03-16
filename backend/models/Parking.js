const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({

name:String,

location:String,

slots:Number,

price:Number,

image:String

});

module.exports = mongoose.model("Parking",parkingSchema);