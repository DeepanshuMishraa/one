import { trpcServer } from "@repo/trpc/server";

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const getCalendarEventsToolDefination = {
  name: "get_calendar_events",
  description: "Get events from the user's calendar for a specific date range",
  parameters: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        description: "Start date for filtering events (ISO string format)"
      },
      endDate: {
        type: "string",
        description: "End date for filtering events (ISO string format)"
      }
    }
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
    const data = await trpcServer.calendar.getCalendarEvents();

    if (!data?.events?.length) {
      return JSON.stringify({
        message: "No events found",
        events: []
      });
    }

    const startDate = toolArgs.startDate ? new Date(toolArgs.startDate) : null;
    const endDate = toolArgs.endDate ? new Date(toolArgs.endDate) : null;

    const filteredEvents = data.events.filter(event => {
      if (!startDate && !endDate) return true;

      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (startDate && (!endDate || isSameDay(startDate, endDate))) {
        return isSameDay(eventStart, startDate) ||
          (eventStart <= startDate && eventEnd >= startDate);
      }

      if (startDate && endDate) {
        return (eventStart >= startDate && eventStart <= endDate) ||
          (eventStart <= startDate && eventEnd >= startDate);
      }

      if (startDate) {
        return eventStart >= startDate;
      }

      if (endDate) {
        return isSameDay(eventEnd, endDate) || eventEnd <= endDate;
      }

      return true;
    });

    const relevantInfo = filteredEvents.map((event) => ({
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      description: event.description || "No Description for this event",
      location: event.location || "No Location for this event",
      attendees: event.attendees?.map((attendee) => ({
        name: attendee.displayName || attendee.email,
        email: attendee.email,
      })),
      color: event.color || "blue"
    }));

    if (relevantInfo.length === 0) {
      return JSON.stringify({
        message: `No events found${startDate ? ` for ${startDate.toLocaleDateString()}` : ""}${endDate && !isSameDay(startDate!, endDate) ? ` to ${endDate.toLocaleDateString()}` : ""}`,
        events: []
      }, null, 2);
    }

    return JSON.stringify({
      message: `Found ${relevantInfo.length} event${relevantInfo.length === 1 ? "" : "s"}${startDate ? ` for ${startDate.toLocaleDateString()}` : ""}${endDate && !isSameDay(startDate!, endDate) ? ` to ${endDate.toLocaleDateString()}` : ""}`,
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
