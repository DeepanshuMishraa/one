"use client";

import { useState, useMemo } from "react";
import { trpc } from "@repo/trpc/client";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { signIn } from "@repo/auth/client";

export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald" as EventColor,
    isActive: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange" as EventColor,
    isActive: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet" as EventColor,
    isActive: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue" as EventColor,
    isActive: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose" as EventColor,
    isActive: true,
  },
];

const colorMap: { [key: string]: EventColor } = {
  "1": "blue",
  "2": "emerald",
  "3": "violet",
  "4": "rose",
  "5": "orange",
  "6": "blue",
  "7": "violet",
  "8": "emerald",
  "9": "orange",
  "10": "rose",
  "11": "blue",
};

export default function Component() {
  const [activeEtiquettes, setActiveEtiquettes] = useState(etiquettes);

  const { data: calendarData, isLoading, error } = trpc.calendar.getCalendarEvents.useQuery(undefined, {
    retry: false, 
  });

  const events = useMemo(() => {
    if (!calendarData?.events) return [];

    return calendarData.events.map((event): CalendarEvent => {
      return {
        id: event.id,
        title: event.title,
        description: event.description || "",
        start: new Date(event.start),
        end: new Date(event.end),
        color: event.color || "blue",
        location: event.location || "",
      };
    });
  }, [calendarData?.events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventEtiquette = activeEtiquettes.find((e) => e.color === event.color);
      return eventEtiquette?.isActive ?? false;
    });
  }, [events, activeEtiquettes]);

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

  if (error?.message?.includes("reconnect your Google account")) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <div className="text-lg font-medium ">
          Please connect your Google Calendar to continue
        </div>
        <p className="text-sm  max-w-md text-center">
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg ">Loading calendar...</div>
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
