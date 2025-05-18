'use client'

import { useState } from 'react'
import Calendar from './calendar/calendar'
import { CalendarEvent, Mode } from './calendar/calendar-types'
import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '../../actions/actions'


/**
 * Displays a calendar interface with events fetched asynchronously.
 *
 * Fetches calendar events, manages loading and error states, and renders a calendar view with the retrieved events. Allows users to switch calendar modes and select dates.
 *
 * @returns The rendered calendar component with events, or a loading or error message if applicable.
 */
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

      return response.events.map((event) => ({
        id: event.id,
        title: event.summary,
        description: event.description || undefined,
        start: new Date(event.start),
        end: new Date(event.end),
        location: event.location || undefined,
        attendees: event.attendees || undefined,
        status: event.status || undefined,
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
