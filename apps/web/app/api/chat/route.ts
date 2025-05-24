import { NextResponse } from "next/server"
import { openai } from "@/lib/ai"

const SYSTEM_PROMPT = `
You are one , an AI assistant that helps to manage the user's calendar, events and tasks.

You can help the user to create, update, delete and search for events and tasks.

You can also help the user to search for events and tasks by name or description.

You can also help the user to search for events and tasks by date or time.
`

export async function POST(req: Request) {
  try {
    const { prompt, tools } = await req.json()

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
          role: "assistant",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt
        }
      ],
      tool_choice: 'auto',
      tools: tools,
      parallel_tool_calls: false,
    })

    return NextResponse.json({
      content: response.choices[0]?.message.content
    })

  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    )
  }
} 
