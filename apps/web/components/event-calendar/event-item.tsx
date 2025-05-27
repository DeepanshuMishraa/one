"use client"

import type React from "react"

import { useMemo } from "react"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns"

import { getBorderRadiusClasses, getEventColorClasses, type CalendarEvent } from "@/components/event-calendar"
import { cn } from "@/lib/utils"

const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase()
}

interface EventWrapperProps {
  event: CalendarEvent
  isFirstDay?: boolean
  isLastDay?: boolean
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
  currentTime?: Date
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) {
  const displayEnd = currentTime
    ? new Date(new Date(currentTime).getTime() + (new Date(event.end).getTime() - new Date(event.start).getTime()))
    : new Date(event.end)

  const isEventInPast = isPast(displayEnd)

  // Check if this is a holiday event
  const isHoliday =
    event.title.toLowerCase().includes("holiday") ||
    event.title.toLowerCase().includes("birthday") ||
    event.title.toLowerCase().includes("purnima") ||
    (event.title.toLowerCase().includes("day") && event.allDay)

  // Add special styling for holiday events
  const holidayStyles = isHoliday ? {
    height: 'var(--event-height)',
    minHeight: 'var(--event-height)',
    maxHeight: 'var(--event-height)',
    overflow: 'hidden'
  } : {}

  return (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full overflow-hidden px-2 py-1 text-left font-medium transition-all duration-200 outline-none select-none focus-visible:ring-2 data-dragging:cursor-grabbing data-dragging:scale-105 data-dragging:shadow-lg data-past-event:opacity-60 data-past-event:line-through",
        getEventColorClasses(event.color, isHoliday),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        "hover:scale-[1.02] hover:z-10 relative",
        className,
      )}
      style={holidayStyles}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  )
}

interface EventItemProps {
  event: CalendarEvent
  view: "month" | "week" | "day" | "agenda"
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  currentTime?: Date
  isFirstDay?: boolean
  isLastDay?: boolean
  children?: React.ReactNode
  className?: string
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start)
  }, [currentTime, event.start])

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(new Date(currentTime).getTime() + (new Date(event.end).getTime() - new Date(event.start).getTime()))
      : new Date(event.end)
  }, [currentTime, event.start, event.end])

  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart)
  }, [displayStart, displayEnd])

  const getEventTime = () => {
    if (event.allDay) return "All day"

    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart)
    }

    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
  }

  const isHoliday =
    event.title.toLowerCase().includes("holiday") ||
    event.title.toLowerCase().includes("birthday") ||
    event.title.toLowerCase().includes("purnima") ||
    (event.title.toLowerCase().includes("day") && event.allDay)

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn("mt-[var(--event-gap)] h-[var(--event-height)] items-center text-xs font-medium", className)}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children || (
          <div className="flex items-center gap-1 w-full min-w-0">
            {isHoliday && <span className="text-xs">🎉</span>}
            <span className="truncate flex-1">
              {!event.allDay && (
                <span className="text-xs font-normal opacity-80 mr-1">
                  {formatTimeWithOptionalMinutes(displayStart)}
                </span>
              )}
              {event.title}
            </span>
          </div>
        )}
      </EventWrapper>
    )
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1.5 px-2",
          durationMinutes < 45 ? "items-center" : "flex-col justify-start",
          view === "week" ? "text-xs" : "text-sm",
          className,
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {durationMinutes < 45 ? (
          <div className="flex items-center gap-1 w-full min-w-0">
            {isHoliday && <span className="text-xs">🎉</span>}
            <span className="truncate flex-1 font-medium">{event.title}</span>
            {showTime && (
              <span className="text-xs opacity-75 font-normal">{formatTimeWithOptionalMinutes(displayStart)}</span>
            )}
          </div>
        ) : (
          <div className="w-full space-y-0.5">
            <div className="flex items-center gap-1">
              {isHoliday && <span className="text-xs">🎉</span>}
              <span className="truncate font-medium text-sm">{event.title}</span>
            </div>
            {showTime && <div className="text-xs opacity-75 font-normal">{getEventTime()}</div>}
            {event.location && <div className="text-xs opacity-75 truncate">📍 {event.location}</div>}
          </div>
        )}
      </EventWrapper>
    )
  }

  // Agenda view
  return (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-2 rounded-lg p-3 text-left transition-all duration-200 outline-none focus-visible:ring-2 data-past-event:line-through data-past-event:opacity-75 hover:scale-[1.01] hover:shadow-md",
        getEventColorClasses(event.color, isHoliday),
        className,
      )}
      data-past-event={isPast(new Date(event.end)) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="flex items-center gap-2">
        {isHoliday && <span className="text-sm">🎉</span>}
        <span className="font-medium text-sm">{event.title}</span>
      </div>
      <div className="text-xs opacity-80 space-y-1">
        <div>
          {event.allDay ? (
            <span>All day</span>
          ) : (
            <span>
              {formatTimeWithOptionalMinutes(displayStart)} - {formatTimeWithOptionalMinutes(displayEnd)}
            </span>
          )}
        </div>
        {event.location && (
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
      {event.description && <div className="text-xs opacity-90 line-clamp-2">{event.description}</div>}
    </button>
  )
}
