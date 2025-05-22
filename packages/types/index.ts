import { z } from "zod";

export const addWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const createCalendarEventSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
});

export const updateCalendarEventSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
});

export const deleteCalendarEventSchema = z.object({
  id: z.string().min(1, "Event ID is required"),
});

export const participantSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  responseStatus: z.string(),
  optional: z.boolean(),
  organizer: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});


export const attendeeSchema = z.object({
  email: z.string(),
  displayName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  responseStatus: z.string(),
  optional: z.boolean(),
  organizer: z.boolean()
});

export type CalendarView = "month" | "week" | "day" | "agenda";

export interface Attendee {
  email: string;
  displayName?: string;
  photoUrl?: string;
  responseStatus: string;
  optional: boolean;
  organizer: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  label?: string;
  location?: string;
  attendees?: Attendee[];
}

export interface CalendarEventResponse {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: Attendee[];
  status?: string;
  created?: string;
  updated?: string;
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";
