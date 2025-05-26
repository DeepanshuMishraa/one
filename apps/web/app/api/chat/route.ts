import { CoreMessage, generateText, tool } from "ai";
import { client } from "@/lib/mem0"
import { z } from "zod";
import { CalendarEventsTool } from "@/lib/tools/calendar";
import { groq } from "@ai-sdk/groq";
import { auth } from "@repo/auth/auth";
import { headers } from "next/headers";
import { Message } from "mem0ai";

const MEMORY_WINDOW_SIZE = 10;
const SYSTEM_PROMPT = `
You are one, an AI assistant with memory of recent conversations. You can remember and reference information shared within the current conversation context (last ${MEMORY_WINDOW_SIZE} messages).

You can help the user to:
- View calendar events for specific dates or date ranges
- Check today's events
- Search for events by name or description
- Get event details including attendees and location

When asked about events for "today" or "now", you should use the current date: ${new Date().toISOString().split('T')[0]}.
When asked about specific dates, use those dates in your tool calls.
Always format dates as ISO strings (YYYY-MM-DD) when making tool calls.

Important memory guidelines:
- You can reference information from recent messages in the current conversation
- If asked about something mentioned in the current conversation, use that context to respond
- If asked about something from a past conversation that's not in current context, politely explain that you can only access recent messages
- Be transparent about your memory limitations while staying helpful
`;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    const { prompt } = await req.json();

    const history = await client.search(prompt, {
      limit: MEMORY_WINDOW_SIZE,
      user_id: session?.user.id as string,
      threshold: 0.0
    })

    console.log("Search results from memory:", JSON.stringify(history, null, 2))

    const memoryMessages = history.map(item => ({
      role: "assistant" as const,
      content: item.memory || ""
    }));

    const messages: CoreMessage[] = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
      ...memoryMessages,
      {
        role: "user" as const,
        content: prompt
      }
    ];

    console.log("Messages being sent to LLM:", messages);

    const response = await generateText({
      model: groq("qwen-qwq-32b"),
      messages: messages,
      toolChoice: "auto",
      tools: {
        getCalendarEvents: tool({
          description: "Get the events for a specific date or date range from the user's calendar.",
          parameters: z.object({
            startDate: z.string().optional().describe("The start date in ISO format (YYYY-MM-DD)"),
            endDate: z.string().optional().describe("The end date in ISO format (YYYY-MM-DD)"),
          }),
          execute: async ({ startDate, endDate }) => {
            try {
              console.log("Tool execution started with:", { startDate, endDate });

              const events = await CalendarEventsTool({
                toolArgs: { startDate, endDate },
                userMessage: prompt
              });

              console.log("Tool execution completed");
              return events;
            } catch (error) {
              console.error("Tool execution error:", error);
              return JSON.stringify({
                error: "Failed to fetch calendar events",
                message: error instanceof Error ? error.message : "Unknown error occurred"
              });
            }
          }
        })
      }
    });

    await client.add(messages as Message[], { user_id: session?.user.id as string })

    return Response.json({
      content: response.text,
      tool_calls: response.toolCalls?.length > 0
    });

  } catch (error) {
    console.error("Route handler error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
