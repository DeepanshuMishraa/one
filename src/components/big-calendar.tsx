"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";

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

  const { data: calendarData, isLoading } = trpc.getCalendarEvents.useQuery();

  const events = useMemo(() => {
    if (!calendarData?.events) return [];

    return calendarData.events.map((event): CalendarEvent => {
      const color = event.colorId ? colorMap[event.colorId] || "blue" : "blue";

      return {
        id: event.id,
        title: event.summary,
        description: event.description || "",
        start: new Date(event.start),
        end: new Date(event.end),
        color,
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
  const createEventMutation = trpc.createCalendarEvent.useMutation({
    onSuccess: () => {
      utils.getCalendarEvents.invalidate();
    },
  });
  const updateEventMutation = trpc.updateCalendarEvent.useMutation({
    onSuccess: () => {
      utils.getCalendarEvents.invalidate();
    },
  });
  const deleteEventMutation = trpc.deleteCalendarEvent.useMutation({
    onSuccess: () => {
      utils.getCalendarEvents.invalidate();
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
