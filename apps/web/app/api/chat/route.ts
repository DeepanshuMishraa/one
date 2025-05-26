import { type CoreMessage, generateText, tool } from "ai"
import { client } from "@/lib/mem0"
import { z } from "zod"
import { groq } from "@ai-sdk/groq"
import { auth } from "@repo/auth/auth"
import { headers } from "next/headers"
import type { Message } from "mem0ai"
import axios from "axios"
import { trpcServer } from "@repo/trpc/server"

const MEMORY_WINDOW_SIZE = 10
const SYSTEM_PROMPT = `
You are one, an AI assistant with memory of recent conversations. You can remember and reference information shared within the current conversation context (last ${MEMORY_WINDOW_SIZE} messages).

You can help the user to:
- Get weather information for any location
- View calendar events for specific dates or date ranges
- Check today's events
- Search for events by name or description
- Get event details including attendees and location

When asked about events for "today" or "now", you should use the current date: ${new Date().toISOString().split("T")[0]}.
When asked about specific dates, use those dates in your tool calls.
Always format dates as ISO strings (YYYY-MM-DD) when making tool calls.

Important memory guidelines:
- You can reference information from recent messages in the current conversation
- If asked about something mentioned in the current conversation, use that context to respond
- If asked about something from a past conversation that's not in current context, politely explain that you can only access recent messages
- Be transparent about your memory limitations while staying helpful
`

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Helper function to parse natural language dates
function parseDate(dateString: string): Date | null {
  try {
    // Handle common formats
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }

    // Handle "today", "tomorrow", etc. if needed
    const today = new Date()
    const lowerCase = dateString.toLowerCase()

    if (lowerCase === "today") {
      return today
    }

    if (lowerCase === "tomorrow") {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }

    return null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { prompt } = await req.json()

    const history = await client.search(prompt, {
      limit: MEMORY_WINDOW_SIZE,
      user_id: session.user.id,
      threshold: 0.0,
    })

    console.log("Search results from memory:", JSON.stringify(history, null, 2))

    const memoryMessages = history.map((item) => ({
      role: "assistant" as const,
      content: item.memory || "",
    }))

    const messages: CoreMessage[] = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
      ...memoryMessages,
      {
        role: "user" as const,
        content: prompt,
      },
    ]

    console.log("Messages being sent to LLM:", messages)

    // Set a timeout for memory operations
    const MEMORY_TIMEOUT = 10000; // 10 seconds timeout

    // Store the conversation in memory with timeout
    const storeMemory = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MEMORY_TIMEOUT);

      try {
        await Promise.race([
          client.add(messages as Message[], {
            user_id: session.user.id
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Memory operation timed out')), MEMORY_TIMEOUT)
          )
        ]);
      } catch (error) {
        console.error('Memory storage failed:', error);
        // Continue execution - memory storage is non-critical
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Execute memory storage in parallel with response generation
    const memoryPromise = storeMemory();

    const response = await generateText({
      model: groq("qwen-qwq-32b"),
      messages: messages,
      toolChoice: "auto",
      tools: {
        getWeather: tool({
          description: "Get the current weather for a specific location",
          parameters: z.object({
            location: z.string().describe("The location to get the weather for (city, country)"),
          }),
          execute: async ({ location }) => {
            try {
              console.log(`Fetching weather for: ${location}`)
              const weatherResponse = await axios.get(
                `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}&aqi=no`,
              )

              const data = weatherResponse.data
              return {
                location: data.location.name,
                country: data.location.country,
                temperature: data.current.temp_c,
                condition: data.current.condition.text,
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                feelsLike: data.current.feelslike_c,
                lastUpdated: data.current.last_updated,
              }
            } catch (error) {
              console.error("Weather API error:", error)
              return {
                error: "Failed to fetch weather data. Please check the location and try again.",
              }
            }
          },
        }),
        getCalendarEvents: tool({
          description:
            "Get events from the user's calendar for a specific date range. If no dates are provided, returns all events. Use ISO date format (YYYY-MM-DD) for dates.",
          parameters: z.object({
            startDate: z
              .string()
              .optional()
              .describe(
                "Start date for filtering events in ISO string format (YYYY-MM-DD). Optional - if not provided, will not filter by start date.",
              ),
            endDate: z
              .string()
              .optional()
              .describe(
                "End date for filtering events in ISO string format (YYYY-MM-DD). Optional - if not provided, will not filter by end date.",
              ),
          }),
          execute: async ({ startDate, endDate }) => {
            try {
              console.log("Calendar tool called with args:", { startDate, endDate })

              const data = await trpcServer.calendar.getCalendarEvents()

              if (!data?.events?.length) {
                return {
                  message: "No events found in your calendar",
                  events: [],
                }
              }

              let parsedStartDate: Date | null = null
              let parsedEndDate: Date | null = null

              if (startDate) {
                parsedStartDate = parseDate(startDate)
                if (!parsedStartDate) {
                  return {
                    error: "Invalid date format",
                    message: "Please provide dates in ISO format (YYYY-MM-DD)",
                  }
                }
              }

              if (endDate) {
                parsedEndDate = parseDate(endDate)
                if (!parsedEndDate) {
                  return {
                    error: "Invalid date format",
                    message: "Please provide dates in ISO format (YYYY-MM-DD)",
                  }
                }
              }

              const filteredEvents = data.events.filter((event) => {
                if (!parsedStartDate && !parsedEndDate) return true

                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)

                if (parsedStartDate && (!parsedEndDate || isSameDay(parsedStartDate, parsedEndDate))) {
                  return (
                    isSameDay(eventStart, parsedStartDate) ||
                    (eventStart <= parsedStartDate && eventEnd >= parsedStartDate)
                  )
                }

                if (parsedStartDate && parsedEndDate) {
                  return (
                    (eventStart >= parsedStartDate && eventStart <= parsedEndDate) ||
                    (eventStart <= parsedStartDate && eventEnd >= parsedStartDate)
                  )
                }

                if (parsedStartDate) {
                  return eventStart >= parsedStartDate
                }

                if (parsedEndDate) {
                  return isSameDay(eventEnd, parsedEndDate) || eventEnd <= parsedEndDate
                }

                return true
              })

              const relevantInfo = filteredEvents.map((event) => ({
                title: event.title,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                description: event.description || "No description",
                location: event.location || "No location specified",
                attendees:
                  event.attendees?.map((attendee) => ({
                    name: attendee.displayName || attendee.email,
                    email: attendee.email,
                  })) || [],
                color: event.color || "blue",
              }))

              const dateRangeText = parsedStartDate
                ? parsedEndDate && !isSameDay(parsedStartDate, parsedEndDate)
                  ? ` from ${parsedStartDate.toLocaleDateString()} to ${parsedEndDate.toLocaleDateString()}`
                  : ` on ${parsedStartDate.toLocaleDateString()}`
                : ""

              if (relevantInfo.length === 0) {
                return {
                  message: `No events found${dateRangeText}`,
                  events: [],
                }
              }

              return {
                message: `Found ${relevantInfo.length} event${relevantInfo.length === 1 ? "" : "s"}${dateRangeText}`,
                events: relevantInfo,
              }
            } catch (error) {
              console.error("Error fetching calendar events:", error)

              if (error instanceof Error && error.message.includes("reconnect your Google account")) {
                return {
                  error: "Authentication Error",
                  message: "Please reconnect your Google Calendar to continue",
                }
              }

              return {
                error: "Failed to fetch calendar events",
                message: error instanceof Error ? error.message : "Unknown error occurred",
              }
            }
          },
        }),
      },
    })

    // Wait for memory storage but don't let it block the response
    try {
      await memoryPromise;
    } catch (error) {
      console.error('Failed to store in memory:', error);
    }

    // Prepare the response with tool execution results
    const responseData = {
      content: response.text,
      toolCalls: response.toolCalls || [],
      toolResults: response.toolResults || [],
      hasToolCalls: (response.toolCalls?.length || 0) > 0,
      finishReason: response.finishReason,
    }

    console.log("API Response:", responseData)

    return Response.json(responseData)
  } catch (error) {
    console.error("Route handler error:", error)

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
