import connect from "../../../config/connectdb";
import DocumentChunk from "../../../models/vector";
import { google } from "@ai-sdk/google";
import { embed, streamText,cosineSimilarity,generateText } from "ai";

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

    // Retrieve all document chunks from the database
    const chunks = await DocumentChunk.find().lean();

    // Calculate cosine similarity between the query embedding and each document chunk's embedding
    const chunksWithSimilarity = chunks.map((chunk) => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort the chunks by similarity in descending order and select the top 10
    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    const topChunks = chunksWithSimilarity.slice(0, 2);

    // Prepare the context for the language model by combining the top chunks' content
    const context = topChunks.map((chunk) => chunk.content).join("\n");

    messages.push({
      role: "user",
      content: `Context: ${context}`,
    });
    const res=generateText({
      model: google("gemini-1.5-pro"),
     
      messages,
    })
    console.log(res.text)
    // Stream the response from the language model back to the client
    const result = streamText({
      model: google("gemini-1.5-pro"),
      
      messages,
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
