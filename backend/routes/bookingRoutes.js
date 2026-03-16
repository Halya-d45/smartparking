const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

router.post("/create", async(req,res)=>{

try{

const booking = new Booking(req.body);

await booking.save();

res.json({message:"Booking confirmed"});

}

catch(err){

res.status(500).json({error:"Booking failed"});

}

});

router.get("/", async(req,res)=>{

const bookings = await Booking.find();

res.json(bookings);

});

module.exports = router;