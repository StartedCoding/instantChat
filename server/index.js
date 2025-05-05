const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");

mongoose.connect("mongodb://localhost:27017/chat-app");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ New user connected:", socket.id);

  // Send old chat history
  Message.find().then((messages) => {
    socket.emit("chatHistory", messages);
  });

  // Handle new message
  socket.on("sendMessage", async ({ username, message }) => {
    const newMsg = new Message({ username, message });
    await newMsg.save();

    // Broadcast to everyone including sender
    io.emit("receiveMessage", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
