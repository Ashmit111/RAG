import connect from "../../../config/connectdb";
import DocumentChunk from "../../../models/vector";
import { google } from "@ai-sdk/google";
import { embed, streamText, cosineSimilarity, generateText } from "ai";

export async function POST(request) {
  try {
    // Parse the request body to get the user's messages
    const { messages } = await request.json();

    // Ensure the database is connected
    await connect();

    // Extract the latest user message
    const lastUserMessage = messages[messages.length - 1]?.content;
    if (!lastUserMessage) {
      return new Response("Invalid request: No user message found", { status: 400 });
    }

    // Generate an embedding for the user's message
    const { embedding: queryEmbedding } = await embed({
      model: google.textEmbeddingModel("embedding-001"),
      value: lastUserMessage,
    });

    // Retrieve only necessary fields from the database
    const chunks = await DocumentChunk.find({}, { content: 1, embedding: 1 }).lean();

    // Calculate cosine similarity
    const chunksWithSimilarity = chunks.map((chunk) => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort and select the top 2
    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    const topChunks = chunksWithSimilarity.slice(0, 2);

    // Prepare context
    const context = topChunks.map((chunk) => chunk.content).join("\n");

    messages.push({
      role: "user",
      content: `Context: ${context}`,
    });

   

    // Stream response properly
    const result = await streamText({
      model: google("gemini-1.5-pro"),
      messages,
    });

    if (!result) {
      return new Response("Error: Streaming response failed", { status: 500 });
    }

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
