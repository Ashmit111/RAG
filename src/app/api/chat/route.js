import connect from '../../../config/connectdb';
import DocumentChunk from '../../../models/vector';

import { embed, streamObject, cosineSimilarity } from 'ai';
import { google } from "@ai-sdk/google";
import { z } from 'zod';

export const responseSchema = z.object({
  explanation: z.string().describe('Detailed explanation related to the user query.'),
  pageNumber: z.number().describe('Page number where the information is found.'),
  pdfName: z.string().describe('Name of the PDF document containing the information.'),
});

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    // Ensure a user message exists
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request: No messages found', { status: 400 });
    }
    
    const lastUserMessage = messages[messages.length - 1]?.content;
    if (!lastUserMessage) {
      return new Response('Invalid request: No user message found', { status: 400 });
    }
    
    // Establish database connection
    await connect();
    
    // Generate an embedding for the user's query
    const { embedding: queryEmbedding } = await embed({
      model: google.textEmbeddingModel("embedding-001"),
      value: lastUserMessage,
    });
    
    // Retrieve document chunks from the database
    const chunks = await DocumentChunk.find().lean();
    
    // Compute cosine similarity for each chunk
    const chunksWithSimilarity = chunks.map((chunk) => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    
    // Sort chunks by similarity in descending order
    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    
    // Use the top chunk if available; otherwise, set default fallback values
    const topChunk = chunksWithSimilarity[0] || {
      content: 'No relevant information found.',
      pdfFile: { name: 'N/A' },
      page: { number: 0 },
    };
    
    // Construct a trimmed prompt
    const prompt = `
User Query: ${lastUserMessage}
Relevant Information: ${topChunk.content}
PDF Name: ${topChunk.pdfFile.name}
Page Number: ${topChunk.page.number}

Provide a detailed explanation based on the relevant information.
    `.trim();
    
    // Stream a structured response using the defined schema
    const result = streamObject({
      model: google('gemini-1.5-pro'),
      prompt,
      schema: responseSchema,
    });
    
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
