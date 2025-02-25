// pdf-embedder/pdfExtractor.js
const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract content from a PDF file with page information
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} - Array of page objects with content and page numbers
 */
async function extractPdfContent(filePath) {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF document to get total number of pages
    const data = await pdfParse(dataBuffer, { max: 1 });
    const totalPages = data.numpages;
    
    console.log(`PDF has ${totalPages} pages`);
    
    // Extract content from each page
    const pages = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageData = await pdfParse(dataBuffer, {
        max: pageNum,
        min: pageNum
      });
      
      // Skip empty pages
      if (!pageData.text.trim()) {
        console.log(`Page ${pageNum} appears to be empty, skipping`);
        continue;
      }
      
      pages.push({
        pageNumber: pageNum,
        content: pageData.text.trim()
      });
      
      // Log progress for large PDFs
      if (pageNum % 10 === 0 || pageNum === totalPages) {
        console.log(`Processed ${pageNum}/${totalPages} pages`);
      }
    }
    
    return pages;
  } catch (error) {
    console.error(`Error extracting PDF content:`, error);
    throw error;
  }
}

/**
 * Extract content from PDF with enhanced table detection
 * This is a more advanced version that tries to preserve table structure
 * @param {string} filePath - Path to the PDF file
 */
async function extractStructuredPdfContent(filePath) {
  // For simple implementation, we'll use the same function
  // In a production environment, you would enhance this with a specialized
  // table extraction library or custom parsing logic
  return extractPdfContent(filePath);
}

module.exports = {
  extractPdfContent,
  extractStructuredPdfContent
};