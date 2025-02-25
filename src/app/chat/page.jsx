"use client";
import { useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResponse([]);

    try {
      const { data } = await axios.get(`https://your-backend-api.com/chat?message=${encodeURIComponent(message)}`, {
        responseType: "json", // Expecting a JSON array
      });
      
      setResponse(data); // Setting the array response directly
      setMessage("");
    } catch (err) {
      console.error("Error fetching response:", err);
      setError("Failed to fetch response");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        {error && (
          <div className="text-red-500 text-sm mb-2 flex items-center justify-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-2 hover:text-red-400">×</button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-900 p-4 rounded-lg">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg py-3 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[50px] max-h-[200px]"
            rows="1"
          />

          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={`p-3 rounded-full ${message.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700"} transition-colors`}
            title="Send message"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSend size={20} className={`${message.trim() ? "text-white" : "text-gray-300"}`} />
            )}
          </button>
        </div>

        {response.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg w-full max-w-2xl">
            <strong>Response:</strong>
            {response.map((line, index) => (
              <p key={index} className="whitespace-pre-line">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
