/**
 * Normalizes and cleans plain text input.
 * @param text The raw input text
 * @returns Cleaned text content
 */
export const cleanText = (text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error("Text content is empty.");
      }

      const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      if (cleaned.length < 10) {
        throw new Error("Text content is too short (minimum 10 characters).");
      }

      resolve(cleaned);
    } catch (error: any) {
      reject(new Error(error.message || 'Failed to clean text content'));
    }
  });
};
