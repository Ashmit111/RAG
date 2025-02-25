// pdf-embedder/models/documentChunk.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentChunkSchema = new Schema({
  // Content and embedding fields
  content: {
    type: String, 
    required: true,
    text: true // Enable text search
  },
  embedding: {
    type: [Number],
    required: true,
    index: true // For vector search when available
  },
  
  // PDF metadata
  pdfFile: {
    name: {
      type: String,
      required: true,
      index: true
    },
    path: String
  },
  
  // Page information
  page: {
    number: {
      type: Number,
      required: true
    },
    title: String
  },
  
  // Unique identifier for the chunk
  chunkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp when document is updated
DocumentChunkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Vector search method (for MongoDB Atlas with vector search capability)
DocumentChunkSchema.statics.findSimilar = async function(queryEmbedding, limit = 5) {
  // Check if vector search index exists
  const collections = await mongoose.connection.db.listCollections({ name: this.collection.name }).toArray();
  const hasVectorIndex = collections.length > 0 && collections[0].info.indexTypes?.includes('vector');
  
  if (hasVectorIndex) {
    // Use vector search if available
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
  } else {
    // Fallback to simple find if vector search is not available
    console.warn("Vector search index not found. Using basic query instead.");
    return this.find({}).limit(limit);
  }
};

const DocumentChunk = mongoose.model('DocumentChunk', DocumentChunkSchema);

module.exports = DocumentChunk;