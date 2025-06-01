import { isSameDay, startOfDay as getStartOfDay, endOfDay as getEndOfDay } from "date-fns";

import type { CalendarEvent, EventColor } from "@/components/event-calendar";

// Add caching for expensive operations
const eventCache = new Map<string, CalendarEvent[]>();

export function getEventColorClasses(color?: EventColor, isHoliday?: boolean) {
  // Special styling for holidays
  if (isHoliday) {
    return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-sm hover:shadow-md"
  }

  // Modern gradient colors for regular events
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-sm hover:shadow-md",
    violet: "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400 shadow-sm hover:shadow-md",
    rose: "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-400 shadow-sm hover:shadow-md",
    emerald: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-400 shadow-sm hover:shadow-md",
    orange: "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-400 shadow-sm hover:shadow-md",
  }

  return colorClasses[color || "blue"]
}

export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean) {
  if (isFirstDay && isLastDay) {
    return "rounded-md"
  }
  if (isFirstDay) {
    return "rounded-l-md"
  }
  if (isLastDay) {
    return "rounded-r-md"
  }
  return ""
}


/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  const cacheKey = `${day.toISOString()}_${events.length}`;

  if (eventCache.has(cacheKey)) {
    return eventCache.get(cacheKey)!;
  }

  const dayStart = getStartOfDay(day);
  const dayEnd = getEndOfDay(day);

  const filteredEvents = events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart < dayEnd;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  eventCache.set(cacheKey, filteredEvents);
  return filteredEvents;
}

// Add cache invalidation
export function invalidateEventCache() {
  eventCache.clear();
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}


export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}
