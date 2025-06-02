import { Hono } from "hono";
import { GetUserSession, getCalendarClient } from "@repo/trpc/utils";
import type { CalendarEvent, Calendar, EventColor } from "@repo/types";
import { calendar_events } from "@repo/db/schema";
import { db } from "@repo/db";

const availableColors: EventColor[] = ["blue", "violet", "rose", "emerald", "orange"];

function getRandomEventColor(): EventColor {
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex] as EventColor;
}

const colorMap: { [key: string]: EventColor } = {
  "1": "violet",  // Lavender
  "2": "emerald", // Sage
  "3": "violet",  // Grape
  "4": "rose",    // Flamingo
  "5": "orange",  // Banana
  "6": "blue",    // Tangerine
  "7": "violet",  // Peacock
  "8": "emerald", // Graphite
  "9": "orange",  // Blueberry
  "10": "rose",   // Basil
  "11": "blue",   // Tomato
};

export const calendarRouter = new Hono()
  .get("/calendars", async (c) => {
    try {
      const session = await GetUserSession();
      const userId = session.id;
      const calendar = await getCalendarClient(userId);

      const response = await calendar.calendarList.list();
      const calendars = response.data.items?.map(cal => ({
        id: cal.id || '',
        summary: cal.summary || '',
        backgroundColor: cal.backgroundColor || '#039BE5',
        primary: cal.primary || false,
        accessRole: cal.accessRole || 'reader',
        selected: cal.selected || false
      })) || [];

      return c.json({ calendars });
    } catch (error) {
      console.error('Calendar list fetch error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch calendars");
    }
  })
  .get("/events", async (c) => {
    try {
      const session = await GetUserSession();
      const userId = session.id;
      const calendar = await getCalendarClient(userId);

      const calendarInfo = await calendar.calendars.get({
        calendarId: 'primary',
      });

      const userTimeZone = calendarInfo.data.timeZone;

      const getHolidayCalendarId = (timeZone: string): string => {
        if (timeZone.startsWith('Asia/')) {
          if (timeZone === 'Asia/Kolkata') {
            return 'en.indian#holiday@group.v.calendar.google.com';
          }
          if (timeZone.includes('Shanghai') || timeZone.includes('Beijing') || timeZone.includes('Hong_Kong')) {
            return 'zh.china#holiday@group.v.calendar.google.com';
          }
          if (timeZone === 'Asia/Tokyo') {
            return 'ja.japanese#holiday@group.v.calendar.google.com';
          }
          if (timeZone === 'Asia/Singapore') {
            return 'en.singapore#holiday@group.v.calendar.google.com';
          }
        }

        if (timeZone.startsWith('Europe/')) {
          if (timeZone === 'Europe/London') {
            return 'en.uk#holiday@group.v.calendar.google.com';
          }
          return 'en.european#holiday@group.v.calendar.google.com';
        }

        if (timeZone.startsWith('Australia/') || timeZone.startsWith('Pacific/Auckland')) {
          return 'en.australian#holiday@group.v.calendar.google.com';
        }
        return 'en.usa#holiday@group.v.calendar.google.com';
      };

      const holidayCalendarId = getHolidayCalendarId(userTimeZone as string);

      const colors = await calendar.colors.get();
      const eventColors = colors.data.event || {};
      const myCalendars = await calendar.calendarList.list();

      const transformCalendar = (calendarItem: any): Calendar | undefined => {
        if (!calendarItem) return undefined;
        return {
          id: calendarItem.id || '',
          summary: calendarItem.summary || '',
          backgroundColor: calendarItem.backgroundColor || '#039BE5',
          primary: calendarItem.primary || false,
          accessRole: calendarItem.accessRole || 'reader',
          selected: calendarItem.selected || false
        };
      };

      const fetchEventsWithRetry = async (calendarId: string, isHoliday = false) => {
        try {
          const response = await calendar.events.list({
            calendarId,
            timeMin: new Date(new Date().getFullYear() - 1, 0, 1).toISOString(),
            timeMax: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            ...(calendarId === 'primary' && { maxResults: 2500 }),
          });
          return response;
        } catch (error) {
          if (isHoliday) {
            console.warn('Holiday calendar access failed:', error);
            return { data: { items: [] } };
          }
          throw error;
        }
      };

      // Fetch events from all calendars
      const calendarPromises = myCalendars.data.items?.map(async (cal) => {
        if (cal.id) {
          return fetchEventsWithRetry(cal.id);
        }
        return { data: { items: [] } };
      }) || [];

      // Add holiday calendar
      calendarPromises.push(fetchEventsWithRetry(holidayCalendarId, true));

      const calendarResponses = await Promise.all(calendarPromises);
      const allEvents = calendarResponses.flatMap(response => response.data.items || []);

      const transformedEvents = allEvents
        .filter(event => event.start?.dateTime || event.start?.date)
        .map(event => {
          const startDateTime = event.start?.dateTime || event.start?.date;
          const endDateTime = event.end?.dateTime || event.end?.date;

          if (!startDateTime || !endDateTime) return null;

          const attendees = event.attendees?.map(attendee => ({
            email: attendee.email || '',
            displayName: attendee.displayName || undefined,
            photoUrl: undefined,
            responseStatus: attendee.responseStatus || 'needsAction',
            optional: attendee.optional || false,
            organizer: attendee.organizer || false
          })) || [];

          const isHoliday = event.organizer?.email === holidayCalendarId;
          const color = event.colorId
            ? colorMap[event.colorId] || getRandomEventColor()  // Use random color if no mapping
            : isHoliday
              ? "rose"
              : getRandomEventColor();  // Use random color as default

          const sourceCalendar = myCalendars.data.items?.find(cal =>
            cal.id === event.organizer?.email || cal.primary
          );

          const calendarEvent: CalendarEvent = {
            id: event.id || '',
            title: event.summary || 'Untitled Event',
            description: event.description || undefined,
            start: new Date(startDateTime),
            end: new Date(endDateTime),
            allDay: !event.start?.dateTime,
            location: event.location || undefined,
            attendees,
            color,
            calendar: sourceCalendar ? transformCalendar(sourceCalendar) : undefined
          };

          return calendarEvent;
        })
        .filter((event): event is CalendarEvent => event !== null);

      for (const event of transformedEvents) {
        await db
          .insert(calendar_events)
          .values({
            id: event.id,
            summary: event.title,
            description: event.description || "",
            startTime: event.start,
            endTime: event.end,
            location: event.location || "",
            attendees: event.attendees || [],
            status: "confirmed",
            event_created_at: new Date(),
            event_updated_at: new Date(),
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: calendar_events.id,
            set: {
              summary: event.title,
              description: event.description || "",
              startTime: event.start,
              endTime: event.end,
              location: event.location || "",
              attendees: event.attendees || [],
              updatedAt: new Date(),
            },
          });
      }

      return c.json({
        events: transformedEvents,
        status: 200
      })
    } catch (error) {
      console.error('Calendar fetch error:', error);
      if (error instanceof Error) {
        if (error.message.includes('invalid_grant') || error.message.includes('Token has been expired')) {
          throw new Error("Your Google account session has expired. Please reconnect your Google account.");
        }
        if (error.message.includes('insufficient authentication scopes')) {
          throw new Error("Insufficient permissions. Please reconnect your Google account with proper calendar access.");
        }
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch calendar events");
    }
  })
  .post("/events", async (c) => {
    try {
      const session = await GetUserSession();
      const userId = session.id;
      const calendar = await getCalendarClient(userId);
      const body = await c.req.json();

      const { summary, description, start, end } = body;

      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary,
          description,
          start: { dateTime: start },
          end: { dateTime: end },
        },
      });

      return c.json(event.data);
    } catch (error) {
      console.error('Create event error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to create event");
    }
  })
  .put("/events/:id", async (c) => {
    try {
      const session = await GetUserSession();
      const userId = session.id;
      const calendar = await getCalendarClient(userId);
      const eventId = c.req.param('id');
      const body = await c.req.json();

      const { summary, description, start, end } = body;

      const event = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: {
          summary,
          description,
          start: { dateTime: start },
          end: { dateTime: end },
        },
      });

      return c.json(event.data);
    } catch (error) {
      console.error('Update event error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to update event");
    }
  })
  .delete("/events/:id", async (c) => {
    try {
      const session = await GetUserSession();
      const userId = session.id;
      const calendar = await getCalendarClient(userId);
      const eventId = c.req.param('id');

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return c.json({ success: true });
    } catch (error) {
      console.error('Delete event error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to delete event");
    }
  });

export type AppType = typeof calendarRouter;
