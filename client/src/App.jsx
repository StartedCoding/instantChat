import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    socket.on("chatHistory", (msgs) => setMessages(msgs));
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { username, message });
      setMessage("");
    }
  };

  if (!chatStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded shadow space-y-4">
          <input
            className="border w-full p-2"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => username.trim() && setChatStarted(true)}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.username === username
                ? "bg-blue-200 self-end text-right"
                : "bg-white"
            }`}
          >
            <div className="font-semibold">{msg.username}</div>
            <div>{msg.message}</div>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border p-2 rounded-l"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
