import prisma from '../config/db';
import { getOrCreateIndex } from '../config/pinecone';
import { ingestSource } from './embedding.service';


export const trainBot = async (botId: string): Promise<void> => {
  try {
    await prisma.bot.update({
      where: { id: botId },
      data: { status: 'training', trainingError: null },
    });

    const sources = await prisma.source.findMany({
      where: { 
        botId,
        status: 'ready'
      },
    });

    if (sources.length === 0) {
      throw new Error("No ready sources found to train on.");
    }

    // Ensure Pinecone index exists
    await getOrCreateIndex(botId);

    // Ingest each source
    let totalChunks = 0;
    for (const source of sources) {
      const chunkCount = await ingestSource(source, botId);  
      
      // Update source with chunk count
      await prisma.source.update({
        where: { id: source.id },
        data: { chunkCount },
      });
      
      totalChunks += chunkCount;
    }

    // Update bot status to ready
    await prisma.bot.update({
      where: { id: botId },
      data: { status: 'ready' },
    });

    console.log(`Bot ${botId} trained successfully with ${totalChunks} chunks.`);
  } catch (error: any) {
    console.error(`Training error for bot ${botId}:`, error);
    
    // Update bot status to error
    await prisma.bot.update({
      where: { id: botId },
      data: { 
        status: 'error', 
        trainingError: error.message || 'Unknown error during training' 
      },
    });
  }
};
