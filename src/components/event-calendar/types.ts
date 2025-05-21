export type CalendarView = "month" | "week" | "day" | "agenda";

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
}

export interface CalendarEventResponse {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: any[];
  status?: string;
  created?: string;
  updated?: string;
}


export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";
