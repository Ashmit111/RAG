// MongoDB Schema for RAG with PDF references
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for vector embeddings with PDF metadata
const DocumentChunkSchema = new Schema({
  // Content and embedding fields
  content: {
    type: String,
    required: true,
    text: true // Enable text indexing for basic text search
  },
  embedding: {
    type: [Number],
    required: true,
    index: true // For vector search
  },
  
  // PDF metadata
  pdfFile: {
    name: {
      type: String,
      required: true,
      index: true
    },
    path: String, // Optional: Store file path or URL
    id: Schema.Types.ObjectId // Optional: Reference to a separate PDF collection
  },
  
  // Page information
  page: {
    number: {
      type: Number,
      required: true
    },
    title: String // Optional: Page or section title
  },
  
  // Additional metadata
  chunkId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create vector index for similarity search - this is a MongoDB 5.0+ feature
// This would be done after schema creation with:
// db.documentChunks.createIndex({ embedding: "vector", dimension: 1536, metric: "cosine" })

// Example usage function to query similar documents with PDF references
DocumentChunkSchema.statics.findSimilar = async function(queryEmbedding, limit = 5) {
  return this.aggregate([
    {
      $vectorSearch: {
        index: "embedding_vector_index",
        queryVector: queryEmbedding,
        path: "embedding",
        numCandidates: 100,
        limit: limit
      }
    },
    {
      $project: {
        content: 1,
        pdfFile: 1,
        page: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);
};

// const DocumentChunk = mongoose.model('DocumentChunk', DocumentChunkSchema);

module.exports = mongoose.models.DocumentChunk ||  mongoose.model('DocumentChunk', DocumentChunkSchema);