import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Check if request body exists
        if (!req.body) {
            return new Response('Missing request body', { status: 400 });
        }

        const { messages } = await req.json();

        // Validate messages
        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid messages format', { status: 400 });
        }

        const result = await streamText({
            model: google('gemini-1.5-pro-latest'),
            messages,
        });

        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error('Chat API error:', error);
        
        // Return appropriate error response
        return new Response(
            error.message || 'Internal server error',
            { status: error.status || 500 }
        );
    }
}