"use client";

import { useState } from "react";
import Calendar from "./calendar/calendar";
import { CalendarEvent, Mode } from "./calendar/calendar-types";
import { trpc } from "@/trpc/client";

export default function CalendarComponent() {
  const [mode, setMode] = useState<Mode>("month");
  const [date, setDate] = useState<Date>(new Date());

  const { isLoading, data, error } = trpc.getCalendarEvents.useQuery(
    undefined,
    {
      select: (response) => {
        return response.events.map((event) => ({
          id: event.id,
          title: event.summary,
          description: event.description,
          start: new Date(event.start),
          end: new Date(event.end),
          location: event.location,
          attendees: event.attendees,
          status: event.status,
          created: event.created ? new Date(event.created) : undefined,
          updated: event.updated ? new Date(event.updated) : undefined,
        })) as CalendarEvent[];
      },
    },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading your calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">
          {error instanceof Error
            ? error.message
            : "Failed to load calendar events"}
        </div>
      </div>
    );
  }

  return (
    <Calendar
      events={data || []}
      setEvents={() => {}}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
    />
  );
}
