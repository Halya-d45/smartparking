const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

userId:String,

parkingId:String,

slot:String,

duration:Number,

date:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Booking",bookingSchema);