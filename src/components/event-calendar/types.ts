export type CalendarView = "month" | "week" | "day" | "agenda";

export interface Attendee {
  email: string;
  displayName?: string;
  photoUrl?: string;
  responseStatus: string;
  optional: boolean;
  organizer: boolean;
}

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
  attendees?: Attendee[];
}

export interface CalendarEventResponse {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: Attendee[];
  status?: string;
  created?: string;
  updated?: string;
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";
