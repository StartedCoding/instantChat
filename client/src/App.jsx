import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://instantchat-csl7.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on("chatHistory", (msgs) => setMessages(msgs));
    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { username, message });
      setMessage("");
    }
  };

  if (!chatStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-700">💬 Welcome!</h1>
          <p className="text-gray-500">Enter your name to join the chat</p>
          <input
            className="border rounded-lg w-full p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full transition"
            onClick={() => username.trim() && setChatStarted(true)}
          >
            🚀 Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-r from-indigo-100 to-pink-100">
      <div className="p-4 bg-white shadow flex items-center justify-between">
        <h2 className="text-xl font-bold text-indigo-600">Live Chat 💬</h2>
        <span className="text-sm text-gray-600">👤 {username}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-xs px-4 py-2 rounded-xl shadow-sm ${
              msg.username === username
                ? "ml-auto bg-blue-200 text-right"
                : "mr-auto bg-white"
            }`}
          >
            <div className="text-sm font-semibold text-gray-800">
              {msg.username}
            </div>
            <div className="text-gray-700 break-words">{msg.message}</div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex items-center p-4 bg-white border-t">
        <input
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-full transition"
          onClick={sendMessage}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;
