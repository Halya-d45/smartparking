const express = require("express");
const router = express.Router();

const Parking = require("../models/Parking");

router.get("/",async(req,res)=>{

const parking = await Parking.find();

res.json(parking);

});

module.exports = router;