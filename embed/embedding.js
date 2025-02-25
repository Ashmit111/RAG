// pdf-embedder/embeddings.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

/**
 * Create embeddings for an array of text chunks
 * @param {Array<string>} texts - Array of text chunks
 * @returns {Promise<Array<Array<number>>>} - Array of embedding vectors
 */
async function createEmbeddings(texts) {
  try {
    const embeddings = [];
    
    // Process each text chunk
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      // Generate embedding
      const embeddingResult = await embeddingModel.embedContent(text);
      const embedding = embeddingResult.embedding.values;
      
      embeddings.push(embedding);
      
      // Log progress
      if ((i + 1) % 10 === 0 || i === texts.length - 1) {
        console.log(`Generated embeddings for ${i + 1}/${texts.length} chunks`);
      }
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Create a single embedding for a query
 * @param {string} text - Query text
 * @returns {Promise<Array<number>>} - Embedding vector
 */
async function createQueryEmbedding(text) {
  try {
    const embeddingResult = await embeddingModel.embedContent(text);
    return embeddingResult.embedding.values;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

module.exports = {
  createEmbeddings,
  createQueryEmbedding
};