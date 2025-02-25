require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { createEmbeddings } = require('./embedding');
const { extractPdfContent } = require('./pdfextracter');
const DocumentChunk = require('./models/vs');
const {connect} = require('./connect');
connect();
// Configuration
const PDF_FOLDER = path.join(__dirname, 'PDF_FOLDER'); // PDF source folder
const MONGODB_URI = process.env.MONGODB_URI
const BATCH_SIZE = 50; // Process 50 pages at a time to manage memory


async function processAllPdfs() {
  try {
   


    // Ensure the PDF folder exists
    if (!fs.existsSync(PDF_FOLDER)) {
      console.log(`Creating PDF folder at ${PDF_FOLDER}`);
      fs.mkdirSync(PDF_FOLDER, { recursive: true });
    }

    // Get all PDF files
    const files = fs.readdirSync(PDF_FOLDER)
      .filter(file => file.toLowerCase().endsWith('.pdf'));

    console.log(`Found ${files.length} PDF files to process`);

    // Process each PDF
    for (const filename of files) {
      await processPdf(filename);
    }

    console.log('All PDFs processed successfully!');
  } catch (error) {
    console.error('Error processing PDFs:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Process a single PDF file
 * @param {string} filename - PDF filename
 */
async function processPdf(filename) {
  try {
    console.log(`\nProcessing PDF: ${filename}`);
    const filePath = path.join(PDF_FOLDER, filename);
    
    // Check if this PDF has been fully processed already
    const existingChunks = await DocumentChunk.countDocuments({ 'pdfFile.name': filename });
    if (existingChunks > 0) {
      console.log(`PDF ${filename} has ${existingChunks} chunks already in database`);
      const shouldSkip = process.env.SKIP_EXISTING === 'true';
      if (shouldSkip) {
        console.log(`Skipping ${filename} as it's already processed`);
        return;
      }
      console.log(`Will update existing chunks for ${filename}`);
    }
    
    // Extract content from PDF with page information
    console.log(`Extracting content from ${filename}...`);
    const pages = await extractPdfContent(filePath);
    console.log(`Extracted ${pages.length} pages from ${filename}`);
    
    // Process pages in batches
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const pageBatch = pages.slice(i, i + BATCH_SIZE);
      await processPageBatch(pageBatch, filename);
      console.log(`Processed batch ${i/BATCH_SIZE + 1}/${Math.ceil(pages.length/BATCH_SIZE)} for ${filename}`);
    }
    
    console.log(`Successfully processed ${filename}`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
}

/**
 * Process a batch of pages
 * @param {Array} pages - Array of page objects with content and page numbers
 * @param {string} filename - PDF filename
 */
async function processPageBatch(pages, filename) {
  try {
    // Extract content from all pages in the batch
    const pageContents = pages.map(page => page.content);
    
    // Generate embeddings for the batch
    console.log(`Generating embeddings for ${pages.length} pages...`);
    const embeddings = await createEmbeddings(pageContents);
    
    // Prepare chunks for MongoDB
    const chunks = pages.map((page, i) => ({
      content: page.content,
      embedding: embeddings[i],
      pdfFile: {
        name: filename,
        path: `/pdfs/${filename}`
      },
      page: {
        number: page.pageNumber,
        title: `Page ${page.pageNumber}`
      },
      chunkId: `${filename.replace(/\s+/g, '_')}_page_${page.pageNumber}`
    }));
    
    // Upsert to MongoDB
    const operations = chunks.map(chunk => ({
      updateOne: {
        filter: { chunkId: chunk.chunkId },
        update: { $set: chunk },
        upsert: true
      }
    }));
    
    const result = await DocumentChunk.bulkWrite(operations);
    console.log(`Stored ${result.upsertedCount} new chunks, updated ${result.modifiedCount} existing chunks`);
  } catch (error) {
    console.error('Error processing page batch:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  processAllPdfs()
    .then(() => console.log('Processing complete'))
    .catch(err => console.error('Processing failed:', err))
    .finally(() => process.exit(0));
}

module.exports = { processAllPdfs };