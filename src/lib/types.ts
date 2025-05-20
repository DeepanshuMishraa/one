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
