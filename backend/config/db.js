const mongoose = require("mongoose");

const connectDB = async () => {

try {

    if (!process.env.MONGO_URI) {
        console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables.");
        console.error("Please add MONGO_URI to your Render Environment Variables.");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("------------------------------------");
    console.log("✅ MongoDB Connected Successfully");
    console.log("------------------------------------");
}

catch(err){

console.error("DB connection error:",err);
process.exit(1);

}

};

module.exports = connectDB;