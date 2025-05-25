import { NextResponse } from "next/server"
import { openai } from "@/lib/ai"
import { getCalendarEventsToolDefination } from "@/lib/tools/calendar"
import { runTool } from "@/lib/toolRunner"
import { ChatCompletionMessage } from "openai/resources/chat/completions"

const SYSTEM_PROMPT = `
You are one, an AI assistant that helps to manage the user's calendar, events and tasks.

You can help the user to:
- View calendar events for specific dates or date ranges
- Check today's events
- Search for events by name or description
- Get event details including attendees and location

When asked about events for "today" or "now", you should use the current date.
When asked about specific dates, use those dates in your tool calls.
Always format dates as ISO strings when making tool calls.
`

const AVAILABLE_TOOLS = [{
  type: "function" as const,
  function: getCalendarEventsToolDefination
}]

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt
        }
      ],
      tools: AVAILABLE_TOOLS,
      tool_choice: 'auto',
    })

    const message = response.choices[0]?.message

    if (!message) {
      return NextResponse.json({
        error: "No response from AI"
      }, { status: 500 })
    }

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = await Promise.all(
        message.tool_calls.map(toolCall =>
          runTool(toolCall, prompt)
        )
      );

      const followUp = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt
          },
          message as ChatCompletionMessage,
          {
            role: "tool",
            content: toolResults.join('\n'),
            tool_call_id: message.tool_calls[0]?.id || ""
          }
        ],
      });

      const followUpContent = followUp.choices[0]?.message.content || "No response from AI"

      return NextResponse.json({
        content: followUpContent,
        tool_calls: true
      });
    }

    return NextResponse.json({
      content: message.content,
      tool_calls: false
    })

  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    )
  }
} 
