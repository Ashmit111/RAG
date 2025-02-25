// scripts/indexPdfs.js
import { processPdfsAndStore } from '../utils/embedding';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Self-executing async function
(async () => {
  console.log('Starting PDF processing...');
  
  try {
    const result = await processPdfsAndStore();
    
    if (result.success) {
      console.log(`Successfully processed ${result.count} PDF files`);
    } else {
      console.error('Processing failed:', result.error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    // Ensure the process exits
    process.exit(0);
  }
})();