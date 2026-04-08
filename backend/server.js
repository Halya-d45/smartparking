const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const savedRoutes = require("./routes/savedRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/saved", savedRoutes);

/* HEALTH CHECK */
app.get("/api/health", (req, res) => res.status(200).json({ status: "healthy", timestamp: new Date() }));
app.get("/health", (req, res) => res.status(200).send("OK"));

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname,"../frontend")));

/* OPEN HOME PAGE */
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"../frontend/login.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});