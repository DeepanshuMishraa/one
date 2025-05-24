import OpenAI from "openai";


export const runTool = async (toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall, userMessage: string) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || "{}")
  }

  switch (toolCall.function.name) {
    case "get_calendar_events":
      return; // getCalendarEvents(input)

    case "schedule_event":
      return; // scheduleEvent(input)

    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}

