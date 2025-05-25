import { NextResponse } from "next/server"
import { openai } from "@/lib/ai"
import { getCalendarEventsToolDefination } from "@/lib/tools/calendar"
import { runTool } from "@/lib/toolRunner"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { auth } from "@repo/auth/auth"
import { headers } from "next/headers"
import { getMemory, setMemory, toOpenAIMessages } from "@/lib/memory"


const MEMORY_WINDOW_SIZE = 10;

const SYSTEM_PROMPT = `
You are one, an AI assistant with memory of recent conversations. You can remember and reference information shared within the current conversation context (last ${MEMORY_WINDOW_SIZE} messages).

You can help the user to:
- View calendar events for specific dates or date ranges
- Check today's events
- Search for events by name or description
- Get event details including attendees and location

When asked about events for "today" or "now", you should use the current date.
When asked about specific dates, use those dates in your tool calls.
Always format dates as ISO strings (YYYY-MM-DD) when making tool calls.

Important memory guidelines:
- You can reference information from recent messages in the current conversation
- If asked about something mentioned in the current conversation, use that context to respond
- If asked about something from a past conversation that's not in current context, politely explain that you can only access recent messages
- Be transparent about your memory limitations while staying helpful
`

const AVAILABLE_TOOLS = [{
  type: "function" as const,
  function: getCalendarEventsToolDefination
}]

// Enhanced message validation for Gemini
function validateMessagesForGemini(messages: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
  const validMessages: ChatCompletionMessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === 'system' && msg.content && typeof msg.content === 'string') {
      validMessages.push({ role: 'system', content: msg.content });
      continue;
    }

    if (msg.role === 'user' && msg.content && typeof msg.content === 'string') {
      validMessages.push({ role: 'user', content: msg.content });
      continue;
    }

    if (msg.role === 'assistant') {
      const assistantMsg: ChatCompletionMessageParam = {
        role: 'assistant',
        content: msg.content || null
      };

      if (msg.tool_calls?.length) {
        assistantMsg.tool_calls = msg.tool_calls;
      }

      if (assistantMsg.content || assistantMsg.tool_calls) {
        validMessages.push(assistantMsg);
      }
      continue;
    }

    if (msg.role === 'tool' && msg.content && msg.tool_call_id) {
      validMessages.push({
        role: 'tool',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        tool_call_id: msg.tool_call_id
      });
    }
  }

  return validMessages;
}

// Helper to ensure proper message sequence
function ensureProperMessageSequence(messages: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
  const result: ChatCompletionMessageParam[] = [];
  let lastRole = '';

  for (const msg of messages) {
    if (msg.role === lastRole && msg.role !== 'system') {
      continue;
    }

    if (msg.role === 'tool') {
      const lastMsg = result[result.length - 1];
      if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.tool_calls) {
        continue;
      }
    }

    result.push(msg);
    lastRole = msg.role;
  }

  return result;
}

export async function POST(req: Request) {
  let userId: string | undefined;

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    userId = session.user.id

    // Get existing conversation history
    const conversationStore = await getMemory(userId)
    const history = toOpenAIMessages(conversationStore)

    // Create messages array
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: prompt }
    ]

    // Validate and clean messages
    const validMessages = validateMessagesForGemini(messages);
    const sequentialMessages = ensureProperMessageSequence(validMessages);

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: sequentialMessages,
      tools: AVAILABLE_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 2000
    });

    const message = response.choices[0]?.message

    if (!message) {
      return NextResponse.json({
        error: "No response from AI"
      }, { status: 500 })
    }

    // Store the user prompt and AI response
    await setMemory([
      { role: "user", content: prompt },
      {
        role: "assistant",
        content: message.content || "",
        tool_calls: message.tool_calls
      }
    ], userId)

    // Handle tool calls
    if (message.tool_calls?.length) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          try {
            return await runTool(toolCall, prompt);
          } catch (error) {
            return JSON.stringify({
              error: "Tool execution failed",
              message: error instanceof Error ? error.message : "Unknown error"
            });
          }
        })
      );

      // Store tool results
      const toolMessages = message.tool_calls.map((toolCall, index) => ({
        role: "tool" as const,
        content: toolResults[index] || "No result",
        tool_call_id: toolCall.id
      }));

      await setMemory(toolMessages, userId);

      // Get updated history for follow-up
      const updatedStore = await getMemory(userId);
      const updatedHistory = toOpenAIMessages(updatedStore);

      // Create follow-up messages with careful validation
      const followUpMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...updatedHistory
      ];

      // Validate and sequence messages for follow-up
      const validFollowUpMessages = validateMessagesForGemini(followUpMessages as ChatCompletionMessageParam[]);
      const sequentialFollowUpMessages = ensureProperMessageSequence(validFollowUpMessages);

      try {
        const followUp = await openai.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: sequentialFollowUpMessages,
          tools: AVAILABLE_TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 2000
        });

        const followUpContent = followUp.choices[0]?.message.content || "No response from AI"

        // Store the AI follow-up
        await setMemory([
          { role: "assistant", content: followUpContent }
        ], userId)

        return NextResponse.json({
          content: followUpContent,
          tool_calls: true
        });

      } catch (followUpError) {
        const combinedContent = `Based on your calendar, here's what I found:\n\n${toolResults.join('\n\n')}`;

        await setMemory([
          { role: "assistant", content: combinedContent }
        ], userId)

        return NextResponse.json({
          content: combinedContent,
          tool_calls: true
        });
      }
    }

    return NextResponse.json({
      content: message.content,
      tool_calls: false
    })

  } catch (error) {
    if (userId) {
      try {
        const lastStore = await getMemory(userId)
        const lastMessages = lastStore.messages
        const lastMessage = lastMessages[lastMessages.length - 1]

        if (lastMessage?.role === 'assistant') {
          return NextResponse.json({
            content: lastMessage.content,
            tool_calls: !!lastMessage.tool_calls
          })
        }
      } catch (recoveryError) { }
    }

    return NextResponse.json(
      {
        error: "Failed to get response from AI",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
