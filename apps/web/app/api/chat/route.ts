import { CoreMessage, generateText } from "ai";
import { google } from "@ai-sdk/google";

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


export async function POST(req: Request) {
  const { prompt } = await req.json();

  const messages: CoreMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: prompt
    }
  ];

  const response = await generateText({
    model: google("gemini-2.0-flash", {
      useSearchGrounding: true
    }),
    messages: messages,
  });

  if (!response.response.messages) {
    return new Response("No response from model", { status: 500 });
  }

  return Response.json({
    content: response.text,
    tool_calls: false
  })
}
