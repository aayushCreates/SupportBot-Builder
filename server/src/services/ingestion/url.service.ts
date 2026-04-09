import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Scrapes and extracts meaningful text from a URL.
 * @param url The target website URL
 * @returns Cleaned text content
 */
export const scrapeUrl = async (url: string): Promise<string> => {
  try {
    // Basic validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL protocol. Must be http or https.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal as any
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, footer, header, aside, noscript, [role="navigation"]').remove();

    // Try to find the most relevant content
    let content = '';
    const selectors = ['article', 'main', '[role="main"]', 'body'];
    
    for (const selector of selectors) {
      const el = $(selector);
      if (el.length > 0) {
        content = el.text();
        break;
      }
    }

    // Clean whitespace
    let text = content
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length < 100) {
      throw new Error("Could not extract meaningful content from this URL.");
    }

    // Truncate if extremely long (safety measure)
    const MAX_CHARS = 100000;
    if (text.length > MAX_CHARS) {
      text = text.substring(0, MAX_CHARS) + "... [Content Truncated]";
    }

    return text;
  } catch (error: any) {
    console.error('URL scraping error:', error);
    throw new Error(error.message || 'Failed to scrape URL content');
  }
};
