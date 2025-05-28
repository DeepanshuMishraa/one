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
- Create new calendar events with natural language processing

When creating events:
- Parse natural language dates and times (e.g., "tomorrow at 9AM", "next Friday at 2PM")
- If any required information is missing (title, start time, end time), ask follow-up questions
- Required fields: title/summary, start date/time, end date/time
- Optional fields: description, location, attendees
- Always confirm event details before creation
- Use the current date and time as reference: ${new Date().toISOString()}

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


function parseNaturalLanguageDateTime(input: string): { date: Date | null; hasTime: boolean } {
  const now = new Date()
  const lowerInput = input.toLowerCase().trim()

  if (lowerInput.includes("today")) {
    const timeMatch = lowerInput.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i) || lowerInput.match(/(\d{1,2})\s*(am|pm)/i)

    if (timeMatch) {
      const hour = Number.parseInt(timeMatch[1] || '0')
      const minute = timeMatch[2] ? Number.parseInt(timeMatch[2]) : 0
      const isPM = timeMatch[3]?.toLowerCase() === "pm"

      const date = new Date(now)
      date.setHours(isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour)
      date.setMinutes(minute)
      date.setSeconds(0)
      date.setMilliseconds(0)

      return { date, hasTime: true }
    }
    return { date: new Date(now.getFullYear(), now.getMonth(), now.getDate()), hasTime: false }
  }

  if (lowerInput.includes("tomorrow")) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const timeMatch = lowerInput.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i) || lowerInput.match(/(\d{1,2})\s*(am|pm)/i)

    if (timeMatch) {
      const hour = Number.parseInt(timeMatch[1] || '0')
      const minute = timeMatch[2] ? Number.parseInt(timeMatch[2]) : 0
      const isPM = timeMatch[3]?.toLowerCase() === "pm"

      tomorrow.setHours(isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour)
      tomorrow.setMinutes(minute)
      tomorrow.setSeconds(0)
      tomorrow.setMilliseconds(0)

      return { date: tomorrow, hasTime: true }
    }
    return { date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()), hasTime: false }
  }

  const nextDayMatch = lowerInput.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (nextDayMatch) {
    const targetDay = nextDayMatch[1]?.toLowerCase() ?? ''
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const targetDayIndex = days.indexOf(targetDay)
    const currentDayIndex = now.getDay()

    let daysToAdd = targetDayIndex - currentDayIndex  
    if (daysToAdd <= 0) daysToAdd += 7

    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysToAdd)

    const timeMatch = lowerInput.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i) || lowerInput.match(/(\d{1,2})\s*(am|pm)/i)

    if (timeMatch) {
      const hour = Number.parseInt(timeMatch[1] || '0')
      const minute = timeMatch[2] ? Number.parseInt(timeMatch[2]) : 0
      const isPM = timeMatch[3]?.toLowerCase() === "pm"

      targetDate.setHours(isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour)
      targetDate.setMinutes(minute)
      targetDate.setSeconds(0)
      targetDate.setMilliseconds(0)

      return { date: targetDate, hasTime: true }
    }
    return { date: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()), hasTime: false }
  }

  try {
    const date = new Date(input)
    if (!isNaN(date.getTime())) {
      return { date, hasTime: input.includes(":") || Boolean(input.match(/\d+\s*(am|pm)/i)) }
    }
  } catch {
  }

  return { date: null, hasTime: false }
}

function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date
    }

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

function extractEventDetails(input: string): {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
} {
  const details: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
  } = {};

  // Extract title (look for patterns like "event named X", "create X", etc.)
  const titlePatterns = [
    /(?:event|meeting|appointment)\s+(?:named|called|titled)\s+["']?([^"']+)["']?/i,
    /create\s+(?:an?\s+)?(?:event|meeting|appointment)\s+["']?([^"']+)["']?/i,
    /["']([^"']+)["']\s+(?:event|meeting|appointment)/i,
  ]

  for (const pattern of titlePatterns) {
    const match = input.match(pattern)
    if (match?.[1]) {
      details.title = match[1].trim()
      break
    }
  }

  // Extract time information
  const { date: startTime, hasTime } = parseNaturalLanguageDateTime(input)
  if (startTime) {
    details.startTime = startTime

    // If we have a start time, try to infer end time (default to 1 hour later)
    if (hasTime) {
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 1)
      details.endTime = endTime
    } else {
      // If no specific time, make it an all-day event
      const endTime = new Date(startTime)
      endTime.setDate(endTime.getDate() + 1)
      details.endTime = endTime
    }
  }

  return details
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

    const MEMORY_TIMEOUT = 10000 // 10 seconds timeout

    const storeMemory = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), MEMORY_TIMEOUT)

      try {
        await Promise.race([
          client.add(messages as Message[], {
            user_id: session.user.id,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Memory operation timed out")), MEMORY_TIMEOUT)),
        ])
      } catch (error) {
        console.error("Memory storage failed:", error)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const memoryPromise = storeMemory()

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
        createCalendarEvent: tool({
          description: `Create a new calendar event. This tool can parse natural language input to extract event details.
          If any required information is missing (title, start time, end time), the AI should ask follow-up questions.
          Required fields: summary (title), start (ISO datetime), end (ISO datetime), description
          Optional fields: none`,
          parameters: z.object({
            summary: z.string().describe("The title/summary of the event"),
            description: z.string().describe("Description of the event"),
            start: z.string().describe("Start date and time in ISO format (YYYY-MM-DDTHH:mm:ss)"),
            end: z.string().describe("End date and time in ISO format (YYYY-MM-DDTHH:mm:ss)"),
          }),
          execute: async ({ summary, description, start, end }) => {
            try {
              console.log("Creating calendar event with:", { summary, description, start, end })

              // Validate dates
              const startDate = new Date(start)
              const endDate = new Date(end)

              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return {
                  error: "Invalid date format",
                  message: "Please provide valid start and end dates in ISO format",
                }
              }

              if (startDate >= endDate) {
                return {
                  error: "Invalid date range",
                  message: "End time must be after start time",
                }
              }

              // Call the tRPC procedure to create the event
              const result = await trpcServer.calendar.createCalendarEvent({
                summary,
                description: description || "",
                start: start,
                end: end,
              })

              if (result.status === 200) {
                const event = result.event
                return {
                  success: true,
                  message: `Event "${summary}" created successfully!`,
                  event: {
                    id: event?.id,
                    title: event?.summary,
                    start: event?.start?.dateTime || event?.start?.date,
                    end: event?.end?.dateTime || event?.end?.date,
                    description: event?.description,
                    htmlLink: event?.htmlLink,
                  },
                }
              } else {
                return {
                  error: "Failed to create event",
                  message: "There was an error creating the calendar event",
                }
              }
            } catch (error) {
              console.error("Error creating calendar event:", error)
              return {
                error: "Failed to create event",
                message: error instanceof Error ? error.message : "Unknown error occurred while creating the event",
              }
            }
          },
        }),
        parseEventRequest: tool({
          description: `Parse a natural language event creation request to extract available details.
          Use this tool first when the user wants to create an event to understand what information they've provided
          and what additional information might be needed.`,
          parameters: z.object({
            userInput: z.string().describe("The user's natural language input about creating an event"),
          }),
          execute: async ({ userInput }) => {
            try {
              const extractedDetails = extractEventDetails(userInput)

              const missingFields = []
              if (!extractedDetails.title) missingFields.push("title/name of the event")
              if (!extractedDetails.startTime) missingFields.push("start date and time")

              return {
                extractedDetails: {
                  title: extractedDetails.title || null,
                  startTime: extractedDetails.startTime?.toISOString() || null,
                  endTime: extractedDetails.endTime?.toISOString() || null,
                  location: extractedDetails.location || null,
                  description: extractedDetails.description || null,
                },
                missingFields,
                hasAllRequired: extractedDetails.title && extractedDetails.startTime,
                suggestions: {
                  needsTitle: !extractedDetails.title,
                  needsTime: !extractedDetails.startTime,
                  needsEndTime: !extractedDetails.endTime,
                  hasLocation: !!extractedDetails.location,
                },
              }
            } catch (error) {
              console.error("Error parsing event request:", error)
              return {
                error: "Failed to parse event request",
                message: "Could not understand the event details from your request",
              }
            }
          },
        }),
      },
    })

    try {
      await memoryPromise
    } catch (error) {
      console.error("Failed to store in memory:", error)
    }

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
