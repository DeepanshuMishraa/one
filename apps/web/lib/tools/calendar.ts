import { trpcServer } from "@repo/trpc/server";

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Helper function to parse natural language dates
function parseDate(dateString: string): Date | null {
  try {
    // Handle common formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Handle "today", "tomorrow", etc. if needed
    const today = new Date();
    const lowerCase = dateString.toLowerCase();

    if (lowerCase === 'today') {
      return today;
    }

    if (lowerCase === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return null;
  } catch {
    return null;
  }
}

export const getCalendarEventsToolDefination = {
  name: "get_calendar_events",
  description: "Get events from the user's calendar for a specific date range. If no dates are provided, returns all events. Use ISO date format (YYYY-MM-DD) for dates.",
  parameters: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        description: "Start date for filtering events in ISO string format (YYYY-MM-DD). Optional - if not provided, will not filter by start date."
      },
      endDate: {
        type: "string",
        description: "End date for filtering events in ISO string format (YYYY-MM-DD). Optional - if not provided, will not filter by end date."
      }
    },
    required: []
  }
}

type Args = {
  startDate?: string;
  endDate?: string;
}

export const CalendarEventsTool = async ({
  toolArgs,
  userMessage
}: {
  toolArgs: Args,
  userMessage: string
}) => {
  try {
    console.log("CalendarEventsTool called with args:", toolArgs);

    const data = await trpcServer.calendar.getCalendarEvents();

    if (!data?.events?.length) {
      return JSON.stringify({
        message: "No events found in your calendar",
        events: []
      });
    }

    // Parse dates with better error handling
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (toolArgs.startDate) {
      startDate = parseDate(toolArgs.startDate);
      if (!startDate) {
        console.error("Invalid startDate:", toolArgs.startDate);
        return JSON.stringify({
          error: "Invalid date format",
          message: "Please provide dates in ISO format (YYYY-MM-DD)"
        });
      }
    }

    if (toolArgs.endDate) {
      endDate = parseDate(toolArgs.endDate);
      if (!endDate) {
        console.error("Invalid endDate:", toolArgs.endDate);
        return JSON.stringify({
          error: "Invalid date format",
          message: "Please provide dates in ISO format (YYYY-MM-DD)"
        });
      }
    }

    const filteredEvents = data.events.filter(event => {
      if (!startDate && !endDate) return true;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Single day query
      if (startDate && (!endDate || isSameDay(startDate, endDate))) {
        return isSameDay(eventStart, startDate) ||
          (eventStart <= startDate && eventEnd >= startDate);
      }

      // Date range query
      if (startDate && endDate) {
        return (eventStart >= startDate && eventStart <= endDate) ||
          (eventStart <= startDate && eventEnd >= startDate);
      }

      // Only start date
      if (startDate) {
        return eventStart >= startDate;
      }

      // Only end date
      if (endDate) {
        return isSameDay(eventEnd, endDate) || eventEnd <= endDate;
      }

      return true;
    });

    const relevantInfo = filteredEvents.map((event) => ({
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      description: event.description || "No description",
      location: event.location || "No location specified",
      attendees: event.attendees?.map((attendee) => ({
        name: attendee.displayName || attendee.email,
        email: attendee.email,
      })) || [],
      color: event.color || "blue"
    }));

    const dateRangeText = startDate ?
      (endDate && !isSameDay(startDate, endDate) ?
        ` from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` :
        ` on ${startDate.toLocaleDateString()}`) :
      "";

    if (relevantInfo.length === 0) {
      return JSON.stringify({
        message: `No events found${dateRangeText}`,
        events: []
      }, null, 2);
    }

    return JSON.stringify({
      message: `Found ${relevantInfo.length} event${relevantInfo.length === 1 ? "" : "s"}${dateRangeText}`,
      events: relevantInfo
    }, null, 2);

  } catch (error) {
    console.error("Error fetching calendar events:", error);

    if (error instanceof Error && error.message.includes("reconnect your Google account")) {
      return JSON.stringify({
        error: "Authentication Error",
        message: "Please reconnect your Google Calendar to continue"
      });
    }

    return JSON.stringify({
      error: "Failed to fetch calendar events",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
