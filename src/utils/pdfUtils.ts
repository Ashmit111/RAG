// utils/pdfUtils.js
import pdfjs from 'pdfjs-dist';

// Set the worker source
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract content from a PDF buffer with page information
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<{pages: Array<{pageNumber: number, content: string}>}>}
 */
export async function getPdfContent(pdfBuffer) {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the total number of pages
    const numPages = pdf.numPages;
    console.log(`PDF has ${numPages} pages`);
    
    // Extract text from each page
    const pages = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      
      // Get text content
      const textContent = await page.getTextContent();
      
      // Extract text items and maintain some structure
      let lastY;
      let text = '';
      
      for (const item of textContent.items) {
        if (lastY !== item.transform[5] && text !== '') {
          text += '\n';
        }
        text += item.str;
        lastY = item.transform[5];
      }
      
      // Get annotations (might contain table data)
      const annotations = await page.getAnnotations();
      let tableText = '';
      
      for (const annotation of annotations) {
        if (annotation.subtype === 'Widget' && annotation.fieldType === 'Tx') {
          // This might be a form field containing table data
          tableText += annotation.fieldValue + '\n';
        }
      }
      
      // Combine all text
      const finalContent = text + (tableText ? '\n\n[TABLE CONTENT]:\n' + tableText : '');
      
      pages.push({
        pageNumber: i,
        content: finalContent.trim()
      });
      
      console.log(`Extracted content from page ${i}`);
    }
    
    return { pages };
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw error;
  }
}

/**
 * Extract structured content from a PDF including tables
 * For more advanced table extraction, consider using a specialized library
 * or implementing custom OCR processing
 */
export async function getPdfStructuredContent(pdfBuffer) {
  // This is a placeholder for more advanced extraction
  // You could integrate a table extraction library here
  return getPdfContent(pdfBuffer);
}