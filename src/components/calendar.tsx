'use client'

import { useState } from 'react'
import Calendar from './calendar/calendar'
import { CalendarEvent, CalendarEventResponse, Mode } from './calendar/calendar-types'
import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '../../actions/actions'



export default function CalendarComponent() {
  const [mode, setMode] = useState<Mode>('month')
  const [date, setDate] = useState<Date>(new Date())

  const { isLoading, data, error } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const response = await getCalendarEvents();

      if (response.error || !response.events) {
        throw new Error(response.message as string || "Failed to load calendar events");
      }

      return (response.events as CalendarEventResponse[]).map((event) => ({
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
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          {error instanceof Error ? error.message : "Failed to load calendar events"}
        </div>
      </div>
    );
  }

  return (
    <Calendar
      events={data || []}
      setEvents={() => { }}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
    />
  )
}
