import { Redis } from '@upstash/redis';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

interface BaseMessage {
  id: string;
  createdAt: string;
  role: string;
  content: string;
}

interface UserMessage extends BaseMessage {
  role: 'user';
}

interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  tool_calls?: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

interface ToolMessage extends BaseMessage {
  role: 'tool';
  tool_call_id: string;
}

type EnhancedMessage = UserMessage | AssistantMessage | ToolMessage;

interface ConversationStore {
  messages: EnhancedMessage[];
}

const MEMORY_WINDOW_SIZE = 10;
const MEMORY_TTL = 60 * 60 * 24;

const redis = new Redis({
  url: process.env.REDIS_URL as string,
  token: process.env.REDIS_TOKEN as string,
})

export const setMemory = async (newMessages: Partial<EnhancedMessage>[], userId: string) => {
  const existingStore = await getMemory(userId);

  const enhancedMessages = newMessages.map(msg => {
    const baseMessage = {
      ...msg,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    if (msg.role === 'tool' && msg.tool_call_id) {
      return {
        ...baseMessage,
        role: 'tool',
        content: msg.content || '',
        tool_call_id: msg.tool_call_id
      } as ToolMessage;
    }

    if (msg.role === 'assistant') {
      return {
        ...baseMessage,
        role: 'assistant',
        content: msg.content || '',
        tool_calls: msg.tool_calls
      } as AssistantMessage;
    }

    return {
      ...baseMessage,
      role: 'user',
      content: msg.content || ''
    } as UserMessage;
  });

  const updatedMessages = [...existingStore.messages, ...enhancedMessages];
  const trimmedMessages = updatedMessages.slice(-MEMORY_WINDOW_SIZE);

  const newStore: ConversationStore = { messages: trimmedMessages };
  return await redis.setex(`memory:${userId}`, MEMORY_TTL, newStore);
}

export const getMemory = async (userId: string): Promise<ConversationStore> => {
  const memory = await redis.get<ConversationStore>(`memory:${userId}`);
  return memory || { messages: [] };
}

export const clearMemory = async (userId: string) => {
  return await redis.del(`memory:${userId}`);
}

export const toOpenAIMessages = (store: ConversationStore): OpenAI.Chat.ChatCompletionMessageParam[] => {
  return store.messages.map(msg => {
    if (msg.role === 'user') {
      return {
        role: 'user',
        content: msg.content
      };
    }

    if (msg.role === 'assistant') {
      const assistantMsg = msg as AssistantMessage;
      const openAIMsg: OpenAI.Chat.ChatCompletionMessageParam = {
        role: 'assistant',
        content: assistantMsg.content || null
      };

      if (assistantMsg.tool_calls?.length) {
        openAIMsg.tool_calls = assistantMsg.tool_calls;
      }

      return openAIMsg;
    }

    if (msg.role === 'tool' && (msg as ToolMessage).tool_call_id) {
      return {
        role: 'tool',
        content: msg.content,
        tool_call_id: (msg as ToolMessage).tool_call_id
      };
    }

    return null;
  }).filter(Boolean) as OpenAI.Chat.ChatCompletionMessageParam[];
}
