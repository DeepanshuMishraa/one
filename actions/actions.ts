"use server"

import { db } from "@/db";
import { account, calendar_events, calendarMetadata } from "@/db/schema";
import { auth } from "@/lib/auth"
import { eq, desc, sql } from "drizzle-orm";
import { headers } from "next/headers"
import { google } from "googleapis"
import { CalendarEvent, CalendarEventResponse } from "@/components/calendar/calendar-types";


const GetUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  return session.user;
}

export const getCalendarEvents = async () => {
  try {
    const session = await GetUserSession();
    const userId = session.id;

    const latestEvent = await db
      .select()
      .from(calendar_events)
      .where(eq(calendar_events.userId, userId))
      .orderBy(desc(calendar_events.event_updated_at))
      .limit(1);

    const googleAccount = await db.select().from(account).where(eq(account.userId, userId));

    if (googleAccount.length === 0) {
      return {
        error: "Google account not found",
        message: "Please connect your Google account",
        status: 404,
      }
    };

    const accessToken = googleAccount[0].accessToken;
    const refreshToken = googleAccount[0].refreshToken

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    oauth2Client.on('tokens', async (tokens) => {
      await db.update(account).set({
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
      }).where(eq(account.userId, userId))
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const updatedMin = latestEvent.length > 0
      ? new Date(latestEvent[0].event_updated_at).toISOString()
      : undefined;

    let events: any[] = [];
    let pageToken: string | undefined;
    do {
      const response = await calendar.events.list({
        singleEvents: true,
        orderBy: "startTime",
        pageToken,
        maxResults: 100,
        calendarId: "primary",
        updatedMin,
      });

      if (response.data.items) {
        events = events.concat(response.data.items);
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    const calendarInfo = await calendar.calendars.get({
      calendarId: "primary"
    });

    await db.insert(calendarMetadata).values({
      id: calendarInfo.data.id!,
      summary: calendarInfo.data.summary!,
      description: calendarInfo.data.description || "",
      timeZone: calendarInfo.data.timeZone!,
      calendarId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: calendarMetadata.id,
      set: {
        summary: calendarInfo.data.summary!,
        description: calendarInfo.data.description || "",
        timeZone: calendarInfo.data.timeZone!,
        updatedAt: new Date(),
      }
    });

    // Update events table
    for (const event of events) {
      const startTime = new Date(event.start?.dateTime || event.start?.date);
      const endTime = new Date(event.end?.dateTime || event.end?.date);

      // Skip invalid dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        continue;
      }

      await db.insert(calendar_events).values({
        id: event.id,
        summary: event.summary || "",
        description: event.description || "",
        startTime,
        endTime,
        location: event.location || "",
        attendees: JSON.stringify(event.attendees || []),
        status: event.status || "confirmed",
        event_created_at: new Date(event.created),
        event_updated_at: new Date(event.updated),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: calendar_events.id,
        set: {
          summary: event.summary || "",
          description: event.description || "",
          startTime,
          endTime,
          location: event.location || "",
          attendees: JSON.stringify(event.attendees || []),
          status: event.status || "confirmed",
          event_updated_at: new Date(event.updated),
          updatedAt: new Date(),
        }
      });
    }

    const dbEvents = await db
      .select()
      .from(calendar_events)
      .where(eq(calendar_events.userId, userId))
      .orderBy(desc(calendar_events.startTime));

    const dbCalendar = await db
      .select()
      .from(calendarMetadata)
      .where(eq(calendarMetadata.calendarId, userId))
      .limit(1);

    return {
      events: dbEvents
        .map(event => {
          try {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);

            // Skip events with invalid dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return null;
            }

            const calendarEvent: CalendarEventResponse = {
              id: event.id,
              summary: event.summary,
              start: start.toISOString(),
              end: end.toISOString(),
            };

            // Add optional fields
            if (event.description) calendarEvent.description = event.description;
            if (event.location) calendarEvent.location = event.location;
            if (event.attendees) calendarEvent.attendees = JSON.parse(event.attendees);
            if (event.status) calendarEvent.status = event.status;
            if (event.event_created_at) calendarEvent.created = event.event_created_at.toISOString();
            if (event.event_updated_at) calendarEvent.updated = event.event_updated_at.toISOString();

            return calendarEvent;
          } catch (error) {
            console.error('Error processing event:', error);
            return null;
          }
        })
        .filter((event): event is CalendarEventResponse => event !== null),
      calendar: dbCalendar[0] ? {
        id: dbCalendar[0].id,
        summary: dbCalendar[0].summary,
        description: dbCalendar[0].description,
        timeZone: dbCalendar[0].timeZone,
      } : null,
      status: 200,
    };
  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      error: "Failed to fetch calendar events",
      message: error,
      status: 500,
    }
  }
}


export const createCalendarEvents = async (event: CalendarEvent) => {
  try {
    const session = await GetUserSession();


    const userId = session?.id
    const googleAccount = await db.select().from(account).where(eq(account.userId, userId));

    if (googleAccount.length === 0) {
      return {
        error: "Google account not found",
        message: "Please connect your Google account",
        status: 404,
      }
    }

    const accessToken = googleAccount[0].accessToken;
    const refreshToken = googleAccount[0].refreshToken;

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await db
          .update(account)
          .set({
            accessToken: tokens.access_token,
            ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
          })
          .where(eq(account.userId, userId));
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const calendarInfo = await calendar.calendars.get({
      calendarId: "primary"
    });

    const userTimeZone = calendarInfo.data.timeZone

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: userTimeZone
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: userTimeZone
        },
      },
    });

    return {
      status: 200,
      event: createdEvent.data
    }

  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      error: "Failed to create calendar event",
      message: error,
      status: 500,
    }
  }
}


export const updateCalendarEvent = async (event: CalendarEvent) => {
  try {
    const session = await GetUserSession();

    const userId = session.id;
    const googleAccount = await db.select().from(account).where(eq(account.userId, userId));

    if (googleAccount.length === 0) {
      return {
        error: "Google account not found",
        message: "Please connect your Google account",
        status: 404,
      }
    }

    const access_token = googleAccount[0].accessToken;
    const refresh_token = googleAccount[0].refreshToken;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    });

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await db.update(account).set({
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
        }).where(eq(account.userId, userId));
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const calendarInfo = await calendar.calendars.get({
      calendarId: "primary"
    });

    const userTimeZone = calendarInfo.data.timeZone;

    const updatedEvent = await calendar.events.update({
      calendarId: "primary",
      eventId: event.id,
      requestBody: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: userTimeZone
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: userTimeZone
        },
      },
    });

    return {
      status: 200,
      event: updatedEvent.data
    }

  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      error: "Failed to update calendar event",
      message: error,
      status: 500,
    }
  }
}


export const deleteCalendarEvent = async (eventId: string) => {
  try {
    const session = await GetUserSession();
    const userId = session.id;

    const googleAccount = await db.select().from(account).where(eq(account.userId, userId));

    if (googleAccount.length === 0) {
      return {
        error: "Google account not found",
        message: "Please connect your Google account",
        status: 404,
      }
    }

    const access_token = googleAccount[0].accessToken;
    const refresh_token = googleAccount[0].refreshToken;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refresh_token
    });

    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await db.update(account).set({
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
        }).where(eq(account.userId, userId));
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId
    });

    return {
      status: 200,
      message: "Event deleted successfully"
    }

  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      error: "Failed to delete calendar event",
      message: error,
      status: 500,
    }
  }
}
