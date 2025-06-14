"use client"

import type React from "react"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useCalendarContext } from "./calendar-context"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { toast } from "sonner"

import {
  addHoursToDate,
  AgendaDaysToShow,
  AgendaView,
  CalendarDndProvider,
  type CalendarEvent,
  type CalendarView,
  DayView,
  EventGap,
  EventHeight,
  MonthView,
  WeekCellsHeight,
  WeekView,
} from "@/components/event-calendar"
import { EventSidebar } from "@/components/event-sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import Participants from "@/components/participants"
import { CommandMenu } from "../command-menu"
import { useMediaQuery } from "@/hooks/use-media-query"

export interface EventCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  className?: string
  initialView?: CalendarView
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
}: EventCalendarProps) {
  const { currentDate, setCurrentDate } = useCalendarContext()
  const [calendarState, setCalendarState] = useState<{
    view: CalendarView;
    selectedEvent: CalendarEvent | null;
    isEventSidebarOpen: boolean;
  }>({
    view: initialView,
    selectedEvent: null,
    isEventSidebarOpen: false,
  })
  const { open } = useSidebar()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const memoizedEvents = useMemo(() => events, [events])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        calendarState.isEventSidebarOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setCalendarState(prev => ({ ...prev, view: "month" }))
          break
        case "w":
          setCalendarState(prev => ({ ...prev, view: "week" }))
          break
        case "d":
          setCalendarState(prev => ({ ...prev, view: "day" }))
          break
        case "a":
          setCalendarState(prev => ({ ...prev, view: "agenda" }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [calendarState.isEventSidebarOpen])

  const handlePrevious = () => {
    if (calendarState.view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (calendarState.view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (calendarState.view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (calendarState.view === "agenda") {
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
    }
  }

  const handleNext = () => {
    if (calendarState.view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (calendarState.view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (calendarState.view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (calendarState.view === "agenda") {
      setCurrentDate(addDays(currentDate, AgendaDaysToShow))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    setCalendarState(prev => ({
      ...prev,
      selectedEvent: event,
      isEventSidebarOpen: true
    }));
  }, []);

  const handleEventCreate = useCallback((startTime: Date) => {
    const roundedStartTime = roundToNearestFifteen(startTime);
    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: roundedStartTime,
      end: addHoursToDate(roundedStartTime, 1),
      allDay: false,
    };
    setCalendarState(prev => ({
      ...prev,
      selectedEvent: newEvent,
      isEventSidebarOpen: true
    }));
  }, []);

  const roundToNearestFifteen = (date: Date): Date => {
    const result = new Date(date);
    const minutes = result.getMinutes();
    const remainder = minutes % 15;

    if (remainder !== 0) {
      const roundedMinutes = remainder < 7.5 ?
        minutes - remainder :
        minutes + (15 - remainder);
      result.setMinutes(roundedMinutes);
      result.setSeconds(0);
      result.setMilliseconds(0);
    }
    return result;
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event)
      toast(`Event "${event.title}" updated`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      })
      toast(`Event "${event.title}" added`, {
        description: format(new Date(event.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    }
    setCalendarState(prev => ({
      ...prev,
      isEventSidebarOpen: false,
      selectedEvent: null
    }));
  }

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = memoizedEvents.find((e) => e.id === eventId)
    onEventDelete?.(eventId)
    setCalendarState(prev => ({
      ...prev,
      isEventSidebarOpen: false,
      selectedEvent: null
    }));

    if (deletedEvent) {
      toast(`Event "${deletedEvent.title}" deleted`, {
        description: format(new Date(deletedEvent.start), "MMM d, yyyy"),
        position: "bottom-left",
      })
    }
  }

  // Handle event update from drag and drop
  const handleEventDragUpdate = useCallback((updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);
  }, [onEventUpdate]);

  const viewTitle = useMemo(() => {
    if (calendarState.view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (calendarState.view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else if (calendarState.view === "day") {
      return (
        <>
          <span className="sm:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-sm:hidden md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">{format(currentDate, "EEE MMMM d, yyyy")}</span>
        </>
      )
    } else if (calendarState.view === "agenda") {
      const start = currentDate
      const end = addDays(currentDate, AgendaDaysToShow - 1)

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy")
      } else {
        return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
      }
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, calendarState.view])

  const eventAttendees = useMemo(() => {
    if (!calendarState.selectedEvent?.id) return []
    const event = memoizedEvents.find((e) => e.id === calendarState?.selectedEvent?.id)
    return event?.attendees || []
  }, [calendarState.selectedEvent, memoizedEvents])

  return (
    <div
      className="flex has-data-[slot=month-view]:flex-1 flex-col rounded-lg"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventDragUpdate}>
        <div className={cn("flex flex-col gap-3 py-3 sm:py-5 px-3 sm:px-4", className)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger
                  data-state={open ? "invisible" : "visible"}
                  className="peer size-7 sm:size-8 text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent! lg:data-[state=invisible]:opacity-0 lg:data-[state=invisible]:pointer-events-none transition-opacity ease-in-out duration-200"
                  isOutsideSidebar
                />
                <h2 className="font-semibold text-lg sm:text-xl lg:peer-data-[state=invisible]:-translate-x-8 transition-transform ease-in-out duration-300">
                  {viewTitle}
                </h2>
              </div>
              <Participants participants={eventAttendees} />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <CommandMenu />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handlePrevious}
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                  onClick={handleToday}
                >
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                  onClick={() => {
                    setCalendarState(prev => ({
                      ...prev,
                      selectedEvent: null,
                      isEventSidebarOpen: true
                    }))
                  }}
                >
                  {isMobile ? "New" : "New Event"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3">
                      <span className="capitalize text-xs sm:text-sm">{calendarState.view}</span>
                      <ChevronDownIcon className="opacity-60 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-32">
                    <DropdownMenuItem onClick={() => setCalendarState(prev => ({ ...prev, view: "month" }))}>
                      Month {!isMobile && <DropdownMenuShortcut>M</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalendarState(prev => ({ ...prev, view: "week" }))}>
                      Week {!isMobile && <DropdownMenuShortcut>W</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalendarState(prev => ({ ...prev, view: "day" }))}>
                      Day {!isMobile && <DropdownMenuShortcut>D</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalendarState(prev => ({ ...prev, view: "agenda" }))}>
                      Agenda {!isMobile && <DropdownMenuShortcut>A</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {calendarState.view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={memoizedEvents}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {calendarState.view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={memoizedEvents}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {calendarState.view === "day" && (
            <DayView
              currentDate={currentDate}
              events={memoizedEvents}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {calendarState.view === "agenda" && (
            <AgendaView currentDate={currentDate} events={memoizedEvents} onEventSelect={handleEventSelect} />
          )}
        </div>

        <EventSidebar
          event={calendarState.selectedEvent}
          isOpen={calendarState.isEventSidebarOpen}
          onClose={() => {
            setCalendarState(prev => ({
              ...prev,
              isEventSidebarOpen: false,
              selectedEvent: null
            }))
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  )
}
