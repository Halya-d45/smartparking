const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const savedRoutes = require("./routes/savedRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

connectDB();

app.use(cors());
app.use(express.json());

/* REAL-TIME SOCKET LOGIC */
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("book_slot", (data) => {
    // Broadcast update to everyone
    io.emit("availability_update", {
      hubId: data.hubId,
      newCount: Math.max(0, data.currentSlots - 1)
    });
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/health", (req, res) => res.status(200).send("OK"));
app.use(express.static(path.join(__dirname,"../frontend")));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/login.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
  console.log(`Server running with Real-time WebSockets on port ${PORT}`);
});