"use client";

import { useState, useMemo, memo } from "react";
import { trpc } from "@repo/trpc/client";
import { create } from 'zustand';
import { FixedSizeList as List } from 'react-window';
import { debounce } from 'lodash';

import {
  EventCalendar,
  EventItem,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { signIn } from "@repo/auth/client";
import { TextShimmer } from "./motion-primitives/text-shimmer";


export const etiquettes = [
  {
    id: "1",
    name: "Work",
    color: "#039BE5",
  },
  {
    id: "2",
    name: "Personal",
    color: "#7986CB",
  },

]

// TODO: seperate store for zustand 

interface CalendarState {
  activeCalendars: { id: string; isActive: boolean }[];
  setActiveCalendars: (calendars: { id: string; isActive: boolean }[]) => void;
  toggleCalendar: (calendarId: string) => void;
}

export const useCalendarStore = create<CalendarState>()((set) => ({
  activeCalendars: [],
  setActiveCalendars: (calendars: { id: string; isActive: boolean }[]) =>
    set(() => ({ activeCalendars: calendars })),
  toggleCalendar: (calendarId: string) =>
    set((state) => ({
      activeCalendars: state.activeCalendars.map((cal) =>
        cal.id === calendarId ? { ...cal, isActive: !cal.isActive } : cal
      ),
    })),
}));

export const getEventColor = (backgroundColor: string): EventColor => {
  // Convert hex color to a predefined EventColor
  const colorMap: { [key: string]: EventColor } = {
    '#039BE5': 'blue',    // Default blue
    '#7986CB': 'violet',  // Indigo-ish
    '#33B679': 'emerald', // Green
    '#E67C73': 'rose',    // Red-ish
    '#F6BF26': 'orange',  // Yellow/Orange
  };

  // Default mappings for common Google Calendar colors
  const defaultColorMap: { [key: string]: EventColor } = {
    '#D47483': 'rose',
    '#92E1C0': 'emerald',
    '#9FC6E7': 'blue',
    '#9EA1FF': 'violet',
    '#FED965': 'orange',
  };

  return colorMap[backgroundColor] || defaultColorMap[backgroundColor] || 'blue';
};

export default function Component() {
  const { data: calendarData, isLoading: calendarLoading } = trpc.calendar.getCalendars.useQuery();
  const [activeCalendars, setActiveCalendars] = useState<{ id: string; isActive: boolean }[]>([]);

  const { data: eventsData, isLoading: eventsLoading, error } = trpc.calendar.getCalendarEvents.useQuery(undefined, {
    retry: false,
  });
  useMemo(() => {
    if (calendarData?.calendars && activeCalendars.length === 0) {
      setActiveCalendars(
        calendarData.calendars.map((cal) => ({
          id: cal.id,
          isActive: true,
        }))
      );
    }
  }, [calendarData?.calendars]);

  // Memoize calendar data transformations
  const transformedEvents = useMemo(() => {
    if (!eventsData?.events) return [];

    return eventsData.events.reduce((acc, event) => {
      acc.push({
        id: event.id,
        title: event.title,
        description: event.description || "",
        start: new Date(event.start),
        end: new Date(event.end),
        color: event.calendar ? getEventColor(event.calendar.backgroundColor) : "blue",
        location: event.location || "",
      });
      return acc;
    }, [] as CalendarEvent[]);
  }, [eventsData?.events]);

  // Memoize filtered events with a Map for O(1) lookup
  const activeCalendarMap = useMemo(() => {
    return new Map(activeCalendars.map(cal => [cal.id, cal.isActive]));
  }, [activeCalendars]);

  const filteredEvents = useMemo(() => {
    if (!eventsData?.events) return [];

    return transformedEvents.filter(event => {
      const eventCalendar = eventsData.events.find(e => e.id === event.id)?.calendar;
      if (!eventCalendar) return true;
      return activeCalendarMap.get(eventCalendar.id) ?? true;
    });
  }, [transformedEvents, activeCalendarMap, eventsData?.events]);

  const utils = trpc.useContext();
  const createEventMutation = trpc.calendar.createCalendarEvent.useMutation({
    onSuccess: () => {
      utils.calendar.getCalendarEvents.invalidate();
    },
  });
  const updateEventMutation = trpc.calendar.updateCalendarEvent.useMutation({
    onSuccess: () => {
      utils.calendar.getCalendarEvents.invalidate();
    },
  });
  const deleteEventMutation = trpc.calendar.deleteCalendarEvent.useMutation({
    onSuccess: () => {
      utils.calendar.getCalendarEvents.invalidate();
    },
  });

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      await createEventMutation.mutateAsync({
        summary: event.title,
        description: event.description || "",
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      await updateEventMutation.mutateAsync({
        id: updatedEvent.id,
        summary: updatedEvent.title,
        description: updatedEvent.description || "",
        start: updatedEvent.start.toISOString(),
        end: updatedEvent.end.toISOString(),
      });
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync({
        id: eventId,
      });
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleReconnectGoogle = async () => {
    await signIn.social({
      provider: "google",
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
    });
  };

  const handleCalendarToggle = (calendarId: string) => {
    setActiveCalendars(prev =>
      prev.map(cal =>
        cal.id === calendarId ? { ...cal, isActive: !cal.isActive } : cal
      )
    );
  };

  // For calendar navigation
  const debouncedSetCurrentDate = useMemo(
    () => debounce((date: Date) => setCurrentDate(date), 150),
    []
  );

  if (error?.message?.includes("reconnect your Google account")) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <div className="text-lg font-medium">
          Please connect your Google Calendar to continue
        </div>
        <p className="text-sm max-w-md text-center">
          We need access to your Google Calendar to show and manage your events. Click below to connect your account.
        </p>
        <button
          onClick={handleReconnectGoogle}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  if (calendarLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <TextShimmer className='font-mono text-sm' duration={1}>
          Loading calendar...
        </TextShimmer>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <EventCalendar
        events={filteredEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="week"
      />
    </div>
  );
}

// In the Agenda view for long lists of events
const EventList = memo(({ events }: { events: CalendarEvent[] }) => {
  return (
    <List
      height={400}
      itemCount={events.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <EventItem
          key={events[index]?.id}
          event={events[index]!}
          style={style}
        />
      )}
    </List>
  );
});
