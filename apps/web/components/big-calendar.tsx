"use client";

import { useState, useMemo, memo } from "react";
import { trpc } from "@repo/trpc/client";
import { create } from 'zustand';
import { FixedSizeList as List } from 'react-window';
import type { CSSProperties } from 'react';
import { format } from "date-fns";

import {
  EventCalendar,
  EventItem,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { signIn } from "@repo/auth/client";
import { TextShimmer } from "./motion-primitives/text-shimmer";
import { Button } from "@/components/ui/button";
import { useToastManager } from "./ui/toast";

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
  const toast = useToastManager()

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
    const toastId = toast.add({
      title: `Moving "${updatedEvent.title}"...`,
      id: "move-event",
      type: "loading",
    });
    try {
      await updateEventMutation.mutateAsync({
        id: updatedEvent.id,
        summary: updatedEvent.title,
        description: updatedEvent.description || "",
        start: updatedEvent.start.toISOString(),
        end: updatedEvent.end.toISOString(),
      });
      toast.add({
        title: `Event "${updatedEvent.title}" moved successfully`,
        description: format(new Date(updatedEvent.start), "MMM d, yyyy"),
        id: toastId,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.add({
        title: `Failed to move "${updatedEvent.title}"`,
        description: "Please try again",
        id: toastId,
        type: "error",
      })
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

  if (error?.message.includes("Your Google account session has expired")) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground text-center text-sm sm:text-base">Your Google account session has expired.</p>
        <Button onClick={handleReconnectGoogle} className="w-full sm:w-auto">Reconnect Google Calendar</Button>
      </div>
    );
  }

  if (calendarLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <TextShimmer className='font-mono text-xs sm:text-sm' duration={1}>
          Loading calendar...
        </TextShimmer>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EventCalendar
        events={filteredEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="day"
      />
    </div>
  );
}

const EventRow = memo(({ event, style }: { event: CalendarEvent; style: CSSProperties }) => {
  return (
    <div style={style} className="px-2 sm:px-4 py-1 sm:py-2">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="font-medium text-xs sm:text-sm">{event.title}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});
