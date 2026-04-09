const pdfParse = require('pdf-parse');
import fetch from 'node-fetch';

/**
 * Extracts text from a PDF given its URL.
 * @param fileUrl URL of the PDF (e.g., from Cloudinary)
 * @returns Cleaned text content
 */
export const parsePdf = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const data = await pdfParse(buffer);

    // Clean text: remove excessive whitespace, null characters, etc.
    let text = data.text
      .replace(/\0/g, '') // Remove null characters
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ') // Collapse horizontal whitespace
      .replace(/\n\s*\n/g, '\n\n') // Collapse excessive vertical whitespace
      .trim();

    if (text.length < 50) {
      throw new Error("PDF appears to be image-based/scanned. Please use a text-based PDF.");
    }

    return text;
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    throw new Error(error.message || 'Failed to parse PDF content');
  }
};
