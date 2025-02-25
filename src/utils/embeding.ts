// utils/processPdfs.js
import fs from 'fs';
import path from 'path';
import { embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import { getPdfContent } from './pdfUtils';
import DocumentChunk from '../models/DocumentChunk'; // Import the mongoose model
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const BATCH_SIZE = 100;

/**
 * Process all PDFs in the public/PDFS directory
 * Chunks by page and stores in MongoDB with embeddings
 */
export async function processPdfsAndStore() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    // Path to PDFs folder
    const pdfFolderPath = path.join(process.cwd(), 'public', 'PDFS');
    
    // Get all PDF files in the directory
    const files = fs.readdirSync(pdfFolderPath)
      .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`Found ${files.length} PDF files to process`);
    
    // Process each file
    for (const filename of files) {
      const filePath = path.join(pdfFolderPath, filename);
      await processSinglePdf(filePath, filename);
    }
    
    console.log('All PDFs processed successfully');
    return { success: true, count: files.length };
  } catch (error) {
    console.error('Error processing PDFs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process a single PDF file - extract content by page and store in MongoDB
 */
async function processSinglePdf(filePath, filename) {
  console.log(`Processing ${filename}...`);
  
  try {
    // Read the PDF file as buffer
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Extract content with page information
    const { pages } = await getPdfContent(pdfBuffer);
    
    // Process each page as a separate chunk
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const pageBatch = pages.slice(i, i + BATCH_SIZE);
      await processPageBatch(pageBatch, filename);
    }
    
    console.log(`Finished processing ${filename} (${pages.length} pages)`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
    throw error;
  }
}

/**
 * Process a batch of pages from a PDF
 */
async function processPageBatch(pages, filename) {
  try {
    // Extract page contents
    const pageContents = pages.map(page => page.content);
    
    // Generate embeddings for all pages in this batch
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: pageContents,
    });
    
    // Prepare chunks for MongoDB
    const chunks = pages.map((page, i) => ({
      content: page.content,
      embedding: embeddings[i],
      pdfFile: {
        name: filename,
        path: `/PDFS/${filename}`
      },
      page: {
        number: page.pageNumber,
        title: `Page ${page.pageNumber}`
      },
      chunkId: `${filename.replace(/\s+/g, '_')}_page_${page.pageNumber}`,
    }));
    
    // Insert all chunks into MongoDB
    await DocumentChunk.insertMany(chunks, { ordered: false })
      .catch(err => {
        // Handle duplicate key errors (if chunks already exist)
        if (err.code !== 11000) throw err;
        console.log(`Some chunks for ${filename} already exist, continuing...`);
      });
    
    console.log(`Stored ${chunks.length} pages from ${filename}`);
  } catch (error) {
    console.error('Error processing page batch:', error);
    throw error;
  }
}

export default processPdfsAndStore;