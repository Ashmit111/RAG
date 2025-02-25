"use client";
import { useChat } from "@ai-sdk/react";
import { FiSend } from "react-icons/fi";
import { UserButton } from "@clerk/nextjs";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">

      <div className="flex justify-between pt-8 pr-12">
        <h1 className="text-xl font-semibold pl-6 font-mono">ChatUr-Bot</h1>
        <UserButton />
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col mr-56">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl w-fit max-w-[75%] break-words whitespace-pre-wrap ${m.role === "user"
                ? "bg-[#1d1f1d] text-right"
                : "bg-[#2a2d2a] text-left"
                }`}
            >
              <span className="block font-medium text-gray-400 text-left">
                {m.role === "user" ? "You" : "AI"}
              </span>
              <span className="block text-white">{m.content}</span>
            </div>
          </div>
        ))}
      </div>


      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#161716] flex items-center gap-2 mx-80 rounded-full mb-10">
        <input
          className="flex-1 bg-[#1d1f1d] text-white placeholder-gray-400 rounded-full py-3 px-4 focus:outline-none "
          value={input}
          placeholder="Type a message..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`p-3 rounded-full ${input.trim() ? "bg-[#1d1f1d] hover:bg-[#2c2d2c]" : "bg-[#1d1f1d]"
            } transition-colors`}
        >
          <FiSend size={20} className="text-white" />
        </button>
      </form>
    </div>
  );
}