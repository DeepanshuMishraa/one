"use server"

import { db } from "@/db";
import { account, calendar_events, calendarMetadata } from "@/db/schema";
import { auth } from "@/lib/auth"
import { eq, desc, sql } from "drizzle-orm";
import { headers } from "next/headers"
import { google } from "googleapis"

export const getCalendarEvents = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const userId = session?.user.id;

    // First check if we have any events in the database
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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // If we have events, only fetch updates since the last update time
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

    // Update calendar metadata
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

    // Update  events table
    for (const event of events) {
      await db.insert(calendar_events).values({
        id: event.id,
        summary: event.summary || "",
        description: event.description || "",
        startTime: new Date(event.start?.dateTime || event.start?.date),
        endTime: new Date(event.end?.dateTime || event.end?.date),
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
          startTime: new Date(event.start?.dateTime || event.start?.date),
          endTime: new Date(event.end?.dateTime || event.end?.date),
          location: event.location || "",
          attendees: JSON.stringify(event.attendees || []),
          status: event.status || "confirmed",
          event_updated_at: new Date(event.updated),
          updatedAt: new Date(),
        }
      });
    }

    // Return events from database instead of API response
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
      events: dbEvents.map(event => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.startTime,
        end: event.endTime,
        location: event.location,
        attendees: JSON.parse(event.attendees),
        status: event.status,
        created: event.event_created_at,
        updated: event.event_updated_at,
      })),
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
