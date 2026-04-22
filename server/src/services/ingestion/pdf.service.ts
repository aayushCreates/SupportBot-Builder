import fetch from 'node-fetch';
import { PDFParse } from 'pdf-parse';

export const parsePdf = async (source: string | Buffer): Promise<string> => {
  try {
    let buffer: Buffer;

    if (Buffer.isBuffer(source)) {
      buffer = source;
    } else {
      // Fetch from URL
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Parse PDF
    const data = new PDFParse({
      data: buffer
    });

    const result = await data.getText();

    let text = result.text
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