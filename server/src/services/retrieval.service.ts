import { embedTexts } from './embedding.service';
import { queryChunks } from '../config/pinecone';

/**
 * Retrieves relevant context chunks from Pinecone.
 */
export const retrieveContext = async (botId: string, question: string): Promise<string> => {
  try {
    const embeddings = await embedTexts([question]);  // get Embeddings of the question
    const queryVector = embeddings[0];

    const matches = await queryChunks(botId, queryVector, 5);

    if (matches.length === 0) {
      return "No relevant context found.";
    }

    return matches
      .map(m => `[Source: ${m.sourceName}]\n${m.text}`)
      .join('\n\n---\n\n');
  } catch (error) {
    console.error('Retrieve context error:', error);
    return "Error retrieving context.";
  }
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}


export const buildMessages = (
  systemPrompt: string, 
  context: string, 
  history: ChatMessage[], 
  question: string
): ChatMessage[] => {
  const messages: ChatMessage[] = [
    { 
      role: 'system', 
      content: `${systemPrompt}\n\nUse the following context to answer the user's question. If the answer is not in the context, say that you don't know based on the provided documents. Don't mention the words "context" or "documents" to the user, just answer naturally.\n\nCONTEXT:\n${context}` 
    },
    ...history.slice(-6), // Last 3 exchanges
    { role: 'user', content: question }
  ];

  return messages;
};
