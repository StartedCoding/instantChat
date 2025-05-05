const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Message = require("./models/Message");
require("dotenv").config(); // for .env support

// Use env vars (never hardcode secrets in production)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chat-app";

// Connect MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const app = express();
const server = http.createServer(app);

// 🧱 Middlewares
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://instant-chat-one.vercel.app"], // Add frontend URLs
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());

// 🚫 Rate limiting (anti-DDoS)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// 🔌 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://your-frontend.onrender.com"],
    methods: ["GET", "POST"],
  },
});

// 🔄 Socket Logic
io.on("connection", (socket) => {
  console.log("⚡ New user connected:", socket.id);

  // Send previous chat history
  Message.find().then((messages) => {
    socket.emit("chatHistory", messages);
  });

  // New message
  socket.on("sendMessage", async ({ username, message }) => {
    if (typeof username !== "string" || typeof message !== "string") return;
    if (message.trim() === "") return;

    const newMsg = new Message({ username, message });
    await newMsg.save();

    io.emit("receiveMessage", newMsg); // Broadcast to all
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

// 🟢 Server Start
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
