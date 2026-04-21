import openai from '../config/openai';
import genAI from '../config/gemini';
import prisma from '../config/db';
import { getOrCreateIndex, upsertChunks } from '../config/pinecone';
import { Source } from '@prisma/client';

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
            const words = subChunk.split(" ");
            const overlapWords = words.slice(-Math.floor(overlap / 5));
            const overlapText = overlapWords.join(" ");
            subChunk = overlapText + sentence;
          }
        }
        currentChunk = subChunk;
      } else {
        const overlapText = currentChunk ? currentChunk.slice(-overlap) : "";
        currentChunk = overlapText + paragraph;
      }
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  return chunks.filter(c => c.trim().length > 30);
};

interface EmbedResult {
  embeddings: number[][];
  provider: string;
  dimension: number;
}

export const embedTexts = async (texts: string[], targetProvider: string = 'openai'): Promise<EmbedResult> => {
  let currentProvider = targetProvider;
  
  try {
    if (currentProvider === 'openai') {
      const embeddings: number[][] = [];
      for (let i = 0; i < texts.length; i += 100) {
        const batch = texts.slice(i, i + 100);
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });
        embeddings.push(...response.data.map(d => d.embedding));
      }
      
      const dimension = embeddings[0]?.length || 1536;
      return { embeddings, provider: 'openai', dimension };
    }
  } catch (error: any) {
    // Fallback if it's a quota/balance error and we are allowed to switch
    const isQuotaError = error.status === 429 || error.message?.toLowerCase().includes('insufficient');
    if (isQuotaError) {
      console.warn('OpenAI quota exceeded, falling back to Gemini for embeddings...');
      currentProvider = 'gemini';
    } else {
      throw error;
    }
  }

  // Gemini Fallback
  if (currentProvider === 'gemini') {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embeddings: number[][] = [];

    console.log("Embedding texts using Gemini...", texts.length);
    
    for (const text of texts) {
      const result = await model.embedContent({
        content: {
          role: "user",
          parts: [{ text }]
        }
      });

      embeddings.push(result.embedding.values);
    }
    
    const dimension = embeddings[0]?.length || 0;
    console.log(`Gemini embedding complete. Dimension: ${dimension}`);
    return { embeddings, provider: 'gemini', dimension };
  }

  throw new Error(`Unsupported provider: ${currentProvider}`);
};


export const ingestSource = async (source: Source, botId: string): Promise<number> => {
  try {
    if (!source.content) return 0;

    const chunks = chunkText(source.content);
    if (chunks.length === 0) return 0;

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) throw new Error("Bot not found");

    const { embeddings, provider, dimension } = await embedTexts(chunks, bot.aiProvider);
    
    // If the provider or dimension changed (first success), update the bot
    if (bot.aiProvider !== provider || bot.embeddingDim !== dimension) {
      await prisma.bot.update({
        where: { id: botId },
        data: { aiProvider: provider, embeddingDim: dimension }
      });
    }

    await getOrCreateIndex(botId, dimension);

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
