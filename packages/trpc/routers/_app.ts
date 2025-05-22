import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@repo/db";
import {
  account,
  calendar_events,
  calendarMetadata,
  event_participants,
  waitlist,
} from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@repo/auth/auth";
import { google } from "googleapis";
import { CalendarEvent, EventColor } from "@repo/types";
import {
  addWaitlistSchema,
  attendeeSchema,
  createCalendarEventSchema,
  deleteCalendarEventSchema,
  participantSchema,
  updateCalendarEventSchema,
} from "@repo/types";
import { z } from "zod";

const GetUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  return session.user;
};

type Attendee = z.infer<typeof attendeeSchema>;

type Participant = z.infer<typeof participantSchema>;

// Map Google Calendar colors to our EventColor type
const colorMap: { [key: string]: EventColor } = {
  "1": "blue",    // Lavender
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

export const appRouter = createTRPCRouter({
  waitlist: baseProcedure.query(async () => {
    try {
      const waitlistCount = await db.select().from(waitlist).execute();
      return {
        success: true,
        count: waitlistCount.length,
      } as const;
    } catch (error) {
      throw new Error(`Failed to fetch waitlist count: ${error}`);
    }
  }),
  addToWaitlist: baseProcedure
    .input(addWaitlistSchema)
    .mutation(async ({ input }) => {
      const { email } = input;
      const existingWaitlist = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, email));

      if (existingWaitlist.length > 0) {
        return {
          success: false,
          message: "Email already on waitlist",
        };
      }

      const waitlistCount = await db.select().from(waitlist).execute();
      const newCount = waitlistCount.length + 1;

      await db.insert(waitlist).values({
        id: crypto.randomUUID(),
        email: email,
        count: newCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Email added to waitlist",
      };
    }),
  getCalendarEvents: baseProcedure.query(async () => {
    try {
      const session = await GetUserSession();
      const userId = session.id;

      const googleAccount = await db
        .select()
        .from(account)
        .where(eq(account.userId, userId));

      if (googleAccount.length === 0) {
        throw new Error("Please connect your Google account");
      }

      const accessToken = googleAccount[0].accessToken;
      const refreshToken = googleAccount[0].refreshToken;

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      oauth2Client.on("tokens", async (tokens) => {
        await db
          .update(account)
          .set({
            accessToken: tokens.access_token,
            ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          })
          .where(eq(account.userId, userId));
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });


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

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(new Date().getFullYear() - 1, 0, 1).toISOString(),
        timeMax: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500,
      });


      const holidayResponse = await calendar.events.list({
        calendarId: holidayCalendarId,
        timeMin: new Date(new Date().getFullYear() - 1, 0, 1).toISOString(),
        timeMax: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      const holidayEvents = holidayResponse.data.items || [];
      const allEvents = [...events, ...holidayEvents];

      const transformedEvents = allEvents.map(event => {
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


        const isHoliday = holidayEvents.includes(event);
        const color = event.colorId
          ? colorMap[event.colorId] || "blue"
          : isHoliday
            ? "rose"
            : "blue";

        const calendarEvent: CalendarEvent = {
          id: event.id || '',
          title: event.summary || 'Untitled Event',
          description: event.description || undefined,
          start: new Date(startDateTime),
          end: new Date(endDateTime),
          allDay: !event.start?.dateTime,
          location: event.location || undefined,
          attendees,
          color
        };

        return calendarEvent;
      }).filter((event): event is CalendarEvent => event !== null);

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

      return {
        events: transformedEvents,
        status: 200
      };
    } catch (error) {
      console.error('Calendar fetch error:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch calendar events"
      );
    }
  }),
  createCalendarEvent: baseProcedure
    .input(createCalendarEventSchema)
    .mutation(async ({ input }) => {
      try {
        const session = await GetUserSession();

        const userId = session?.id;
        const googleAccount = await db
          .select()
          .from(account)
          .where(eq(account.userId, userId));

        if (googleAccount.length === 0) {
          throw new Error("Please connect your Google account");
        }

        const accessToken = googleAccount[0].accessToken;
        const refreshToken = googleAccount[0].refreshToken;

        const oauth2Client = new google.auth.OAuth2();

        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        oauth2Client.on("tokens", async (tokens) => {
          if (tokens.access_token) {
            await db
              .update(account)
              .set({
                accessToken: tokens.access_token,
                ...(tokens.refresh_token && {
                  refreshToken: tokens.refresh_token,
                }),
              })
              .where(eq(account.userId, userId));
          }
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const calendarInfo = await calendar.calendars.get({
          calendarId: "primary",
        });

        const userTimeZone = calendarInfo.data.timeZone;

        const createdEvent = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: input.summary,
            description: input.description,
            start: {
              dateTime: input.start,
              timeZone: userTimeZone,
            },
            end: {
              dateTime: input.end,
              timeZone: userTimeZone,
            },
          },
        });

        return {
          event: createdEvent.data,
          status: 200,
        } as const;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to create calendar event",
        );
      }
    }),
  updateCalendarEvent: baseProcedure
    .input(updateCalendarEventSchema)
    .mutation(async ({ input }) => {
      try {
        const session = await GetUserSession();

        const userId = session.id;
        const googleAccount = await db
          .select()
          .from(account)
          .where(eq(account.userId, userId));

        if (googleAccount.length === 0) {
          throw new Error("Please connect your Google account");
        }

        const access_token = googleAccount[0].accessToken;
        const refresh_token = googleAccount[0].refreshToken;

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: access_token,
          refresh_token: refresh_token,
        });

        oauth2Client.on("tokens", async (tokens) => {
          if (tokens.access_token) {
            await db
              .update(account)
              .set({
                accessToken: tokens.access_token,
                ...(tokens.refresh_token && {
                  refreshToken: tokens.refresh_token,
                }),
              })
              .where(eq(account.userId, userId));
          }
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const calendarInfo = await calendar.calendars.get({
          calendarId: "primary",
        });

        const userTimeZone = calendarInfo.data.timeZone;

        const updatedEvent = await calendar.events.update({
          calendarId: "primary",
          eventId: input.id,
          requestBody: {
            summary: input.summary,
            description: input.description,
            start: {
              dateTime: input.start,
              timeZone: userTimeZone,
            },
            end: {
              dateTime: input.end,
              timeZone: userTimeZone,
            },
          },
        });

        return {
          event: updatedEvent.data,
          status: 200,
        } as const;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to update calendar event",
        );
      }
    }),
  deleteCalendarEvent: baseProcedure
    .input(deleteCalendarEventSchema)
    .mutation(async ({ input }) => {
      try {
        const session = await GetUserSession();
        const userId = session.id;

        const googleAccount = await db
          .select()
          .from(account)
          .where(eq(account.userId, userId));

        if (googleAccount.length === 0) {
          throw new Error("Please connect your Google account");
        }

        const access_token = googleAccount[0].accessToken;
        const refresh_token = googleAccount[0].refreshToken;

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
          access_token: access_token,
          refresh_token: refresh_token,
        });

        oauth2Client.on("tokens", async (tokens) => {
          if (tokens.access_token) {
            await db
              .update(account)
              .set({
                accessToken: tokens.access_token,
                ...(tokens.refresh_token && {
                  refreshToken: tokens.refresh_token,
                }),
              })
              .where(eq(account.userId, userId));
          }
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
          calendarId: "primary",
          eventId: input.id,
        });

        return {
          status: 200,
          message: "Event deleted successfully",
        } as const;
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to delete calendar event",
        );
      }
    }),
});
export type AppRouter = typeof appRouter;
