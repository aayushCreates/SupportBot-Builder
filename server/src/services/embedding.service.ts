import openai from '../config/openai';
import { getOrCreateIndex, upsertChunks } from '../config/pinecone';


export const chunkText = (text: string, chunkSize = 500, overlap = 50): string[] => {
  const chunks: string[] = [];
  
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      
      if (paragraph.length > chunkSize) {
        const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+/g) || [paragraph];
        let subChunk = "";
        for (const sentence of sentences) {
          if ((subChunk.length + sentence.length) <= chunkSize) {
            subChunk += (subChunk ? " " : "") + sentence;
          } else {
            if (subChunk) chunks.push(subChunk);
            // Start next subChunk with overlap if possible

            const words = subChunk.split(" ");
            const overlapWords = words.slice(-Math.floor(overlap / 5));
            const overlapText = overlapWords.join(" ");

            // const overlapText = subChunk.slice(-overlap);
            subChunk = overlapText + sentence;
          }
        }
        currentChunk = subChunk;
      } else {
        // Start new chunk with current paragraph, with overlap from previous chunk
        const overlapText = currentChunk ? currentChunk.slice(-overlap) : "";
        currentChunk = overlapText + paragraph;
      }
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  
  // Clean up: filter out very small chunks
  return chunks.filter(c => c.trim().length > 30);
};


export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  const embeddings: number[][] = [];
  
  // Process in batches of 100
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });
    
    embeddings.push(...response.data.map(d => d.embedding));
  }
  
  return embeddings;
};

/**
 * Full ingestion flow for a source.
 */
export const ingestSource = async (source: any, botId: string): Promise<number> => {
  try {
    if (!source.content) return 0;

    const chunks = chunkText(source.content);
    if (chunks.length === 0) return 0;

    await getOrCreateIndex(botId);

    const embeddings = await embedTexts(chunks);
    if (embeddings.length !== chunks.length) {
      throw new Error("Embedding mismatch");
    }

    const batchSize = 100;

    for (let i = 0; i < chunks.length; i += batchSize) {   
      const batch = chunks.slice(i, i + batchSize);
      const batchEmbeddings = embeddings.slice(i, i + batchSize);
      const batchChunks = batch.map((text, j) => ({
        id: `${source.id}-chunk-${i + j}`,
        embedding: batchEmbeddings[j],
        text,
        sourceId: source.id,
        sourceName: source.name,
      }));

      await upsertChunks(botId, batchChunks);
    }

    return chunks.length;
  } catch (error) {
    console.error(`Ingest source error (${source.id}):`, error);
    throw error;
  }
};
