import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

export const getIndexName = (botId: string) => {
  // Pinecone index names: max 45 chars, alphanumeric + hyphens
  // bot- + first 20 chars of botId (stripping hyphens)
  return `bot-${botId.replace(/-/g, '').slice(0, 20)}`;
};

export const getOrCreateIndex = async (botId: string) => {
  const indexName = getIndexName(botId);
  const indexes = await pinecone.listIndexes();
  const exists = indexes.indexes?.some(idx => idx.name === indexName);

  if (!exists) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI text-embedding-3-small dimension
      metric: 'cosine', // angle similarity
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    // Wait a bit for the index to be ready
    let isReady = false;
    while (!isReady) {
      const description = await pinecone.describeIndex(indexName);
      if (description.status.ready) {
        isReady = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  return pinecone.index(indexName);
};

export const upsertChunks = async (botId: string, chunks: any[]) => {
  const indexName = getIndexName(botId);
  const index = pinecone.index(indexName);

  // Batch upsert in groups of 100
  for (let i = 0; i < chunks.length; i += 100) {
    const batch = chunks.slice(i, i + 100);
    await index.upsert({
      records: batch.map(c => ({
        id: c.id,
        values: c.embedding,
        metadata: {
          text: c.text,
          sourceId: c.sourceId,
          sourceName: c.sourceName,
        },
      }))
    });
  }
};

export const queryChunks = async (botId: string, vector: number[], topK = 5) => {
  const indexName = getIndexName(botId);
  const index = pinecone.index(indexName);

  const result = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return result.matches.map(m => ({
    text: m.metadata?.text as string,
    sourceId: m.metadata?.sourceId as string,
    sourceName: m.metadata?.sourceName as string,
    score: m.score,
  }));
};

export const deleteSourceChunks = async (botId: string, sourceId: string) => {
  const indexName = getIndexName(botId);
  const index = pinecone.index(indexName);
  await index.deleteMany({ filter: { sourceId: { '$eq': sourceId } } });
};

export const deleteIndex = async (botId: string) => {
  const indexName = getIndexName(botId);
  await pinecone.deleteIndex(indexName).catch(err => {
    console.warn(`Could not delete Pinecone index ${indexName}:`, err.message);
  });
};

export default pinecone;
