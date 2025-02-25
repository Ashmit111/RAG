'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { FiSend } from 'react-icons/fi';

export const responseSchema = z.object({
  explanation: z.string().describe('Detailed explanation related to the user query.'),
  pageNumber: z.number().describe('Page number where the information is found.'),
  pdfName: z.string().describe('Name of the PDF document containing the information.'),
});


export default function Chat() {
  const { object, submit, loading } = useObject({
    api: '/api/chat',
    schema: responseSchema,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userInput = event.target.elements.userInput.value;
    await submit({ messages: [{ role: 'user', content: userInput }] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex justify-between pt-8 pr-12">
        <h1 className="text-xl font-semibold pl-6 font-mono">ChatUr-Bot</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col mr-56">
        {object && (
          <div className="bg-[#2a2d2a] text-left ml-52 mt-8 mb-6 p-4 rounded-2xl">
            <p className="font-medium text-gray-400">AI</p>
            <p className="text-white">{object.explanation}</p>
            <p className="text-sm text-gray-500">
              Source: {object.pdfName}, Page {object.pageNumber}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-[#161716] flex items-center gap-2 mx-80 rounded-full mb-10">
        <input
          name="userInput"
          className="flex-1 bg-[#1d1f1d] text-white placeholder-gray-400 rounded-full py-3 px-4 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={loading}
          className={`p-3 rounded-full ${loading ? 'bg-[#1d1f1d]' : 'bg-[#1d1f1d] hover:bg-[#2c2d2c]'} transition-colors`}
        >
          <FiSend size={20} className="text-white" />
        </button>
      </form>
    </div>
  );
}
