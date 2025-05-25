import { Pinecone } from '@pinecone-database/pinecone';
import { RecordMetadata } from "@pinecone-database/pinecone";

type MessageRole = "user" | "assistant" | "system" | "tool";

interface MessageMetadata extends RecordMetadata {
  content: string;
  sessionId: string;
  role: MessageRole;
  timestamp: number;
}

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string
});

export const pineconeIndex = pc.Index("gemini");

export async function upsertToPinecone({
  id,
  content,
  embedding,
  sessionId,
  role
}: {
  id: string;
  content: string;
  embedding: number[];
  sessionId: string;
  role: MessageRole;
}) {
  await pineconeIndex.namespace("default").upsert([
    {
      id,
      values: embedding,
      metadata: {
        content,
        sessionId,
        role,
        timestamp: Date.now()
      } as MessageMetadata
    }
  ]);
}

export async function queryPinecone(embedding: number[], conversationId: string) {
  console.log('Querying Pinecone for conversation:', conversationId);

  if (!embedding.length) {
    console.error('Empty embedding vector provided');
    return [];
  }

  try {

    const conversationQuery = await pineconeIndex.namespace("default").query({
      vector: embedding,
      filter: { sessionId: { $eq: conversationId } },
      topK: 50,
      includeMetadata: true
    });

    const vectorQuery = await pineconeIndex.namespace("default").query({
      vector: embedding,
      topK: 50,
      includeMetadata: true
    });

    console.log('Most relevant matches by semantic similarity:');
    vectorQuery.matches
      ?.sort((a, b) => (b.score || 0) - (a.score || 0))
      ?.slice(0, 5)
      ?.forEach(match => {
        console.log(`Score ${match.score?.toFixed(4)}: "${(match.metadata as MessageMetadata)?.content}" (${(match.metadata as MessageMetadata)?.role})`);
      });

    const currentConversationMatches = conversationQuery.matches || [];
    const otherMatches = (vectorQuery.matches || [])
      .filter(match => (match.metadata as MessageMetadata)?.sessionId !== conversationId)
      .filter(match => match.score && match.score > 0.7); // Only keep highly relevant matches from other conversations

    const allMatches = [...currentConversationMatches, ...otherMatches];

    const uniqueMatches = Array.from(
      new Map(allMatches.map(match => [match.id, match])).values()
    ).filter(match => match.metadata);

    const sortedMatches = uniqueMatches.sort((a, b) =>
      (a.metadata as MessageMetadata).timestamp - (b.metadata as MessageMetadata).timestamp
    );

    console.log(`Found ${currentConversationMatches.length} messages in current conversation`);
    console.log(`Found ${otherMatches.length} relevant messages from other conversations`);

    return sortedMatches.map(match => ({
      content: (match.metadata as MessageMetadata)?.content,
      role: (match.metadata as MessageMetadata)?.role,
      score: match.score,
      sessionId: (match.metadata as MessageMetadata)?.sessionId
    }));
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return [];
  }
}
