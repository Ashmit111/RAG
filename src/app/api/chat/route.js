import { google } from "@ai-sdk/google";
import { cosineSimilarity, embed, streamText } from "ai";
import connect from "../../../config/connectdb";
import DocumentChunk from "../../../models/vector";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request) {
  try {
    await connect();
    const { messages } = await request.json();
    const lastUserMessage = messages[messages.length - 1]?.content;

    // Generate embeddings for search
    const { embedding: queryEmbedding } = await embed({
      model: google.textEmbeddingModel("embedding-001"),
      value: lastUserMessage,
    });

    // Get relevant context
    const chunks = await DocumentChunk.find().lean();

    const relevantChunks = chunks
      .map(chunk => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(chunk => chunk.content)
      .join("\n");

    const augmentedMessages = [
      ...messages,
      {
        role: "system",
        content: `Context: ${relevantChunks}`,
      }
    ];

    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages: augmentedMessages,
    });
   
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
