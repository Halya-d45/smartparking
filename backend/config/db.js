const mongoose = require("mongoose");

const connectDB = async () => {

try {

await mongoose.connect("mongodb://127.0.0.1:27017/smartParking");

console.log("MongoDB Connected");

}

catch(err){

console.error("DB connection error:",err);
process.exit(1);

}

};

module.exports = connectDB;