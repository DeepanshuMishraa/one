import OpenAI from "openai";
import { CalendarEventsTool, getCalendarEventsToolDefination } from "./tools/calendar";

export const runTool = async (toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall, userMessage: string) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || "{}")
  }

  switch (toolCall.function.name) {
    case getCalendarEventsToolDefination.name:
      return CalendarEventsTool(input);
    case "schedule_event":
      return; // scheduleEvent(input)
    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}

