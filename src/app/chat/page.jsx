"use client";
import { useChat } from "@ai-sdk/react";
import { FiSend } from "react-icons/fi";

export default function Chat() {
 const { messages, input, handleInputChange, handleSubmit } = useChat();

 return (
   <div className="min-h-screen flex flex-col  bg-black text-white">
     {/* Chat Messages */}
     <div className="flex-1 overflow-y-auto mx-44 p-4 space-y-4 flex flex-col">
       {messages.map((m) => (
         <div
           key={m.id}
           className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
         >
           <div
             className={`px-4 py-3 rounded-2xl max-w-[75%] break-words whitespace-pre-wrap ${
               m.role === "user"
                 ? "bg-[#1d1f1d] text-right"
                 : "bg-[#2a2d2a] text-left"
             }`}
           >
             <span className="block font-medium text-gray-400 text-left mb-1">
               {m.role === "user" ? "You" : "AI"}
             </span>
             <span className="block text-white">{m.content}</span>
           </div>
         </div>
       ))}
     </div>

     {/* Chat Input */}
     <div className="p-4 flex justify-center">
       <form onSubmit={handleSubmit} className="bg-[#161716] flex items-center gap-2 rounded-full px-4 py-2 w-full max-w-2xl">
         <input
           className="flex-1 bg-[#1d1f1d] text-white placeholder-gray-400 rounded-full py-3 px-4 focus:outline-none"
           value={input}
           placeholder="Type a message..."
           onChange={handleInputChange}
         />
         <button
           type="submit"
           disabled={!input.trim()}
           className={`p-3 rounded-full ${
             input.trim() ? "bg-[#1d1f1d] hover:bg-[#2c2d2c]" : "bg-[#1d1f1d]"
           } transition-colors`}
         >
           <FiSend size={20} className="text-white" />
         </button>
       </form>
     </div>
   </div>
 );
}