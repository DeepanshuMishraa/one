"use client"

import type React from "react"
import { useMemo } from "react"
import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns"

import {
  DraggableEvent,
  DroppableCell,
  EventItem,
  isMultiDayEvent,
  useCurrentTimeIndicator,
  WeekCellsHeight,
  type CalendarEvent,
} from "@/components/event-calendar"
import { StartHour, EndHour } from "@/components/event-calendar/constants"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

interface PositionedEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

export function WeekView({ currentDate, events, onEventSelect, onEventCreate }: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])



  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate)
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    })
  }, [currentDate])

  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        return event.allDay || isMultiDayEvent(event)
      })
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return days.some(
          (day) => isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd),
        )
      })
  }, [events, days])

  const processedDayEvents = useMemo(() => {
    const result = days.map((day) => {
      const dayEvents = events.filter((event) => {
        if (event.allDay || isMultiDayEvent(event)) return false

        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        return isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (eventStart < day && eventEnd > day)
      })

      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aStart = new Date(a.start)
        const bStart = new Date(b.start)
        const aEnd = new Date(a.end)
        const bEnd = new Date(b.end)

        if (aStart < bStart) return -1
        if (aStart > bStart) return 1

        const aDuration = differenceInMinutes(aEnd, aStart)
        const bDuration = differenceInMinutes(bEnd, bStart)
        return bDuration - aDuration
      })

      const positionedEvents: PositionedEvent[] = []
      const dayStart = startOfDay(day)

      const columns: { event: CalendarEvent; end: Date }[][] = []

      sortedEvents.forEach((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Adjust start and end times if they're outside this day
        const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart
        const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24)

        // Calculate top position and height
        const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
        const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60

        // Adjust the top calculation to account for the new start time
        const top = (startHour - StartHour) * WeekCellsHeight
        const height = (endHour - startHour) * WeekCellsHeight

        // Find a column for this event
        let columnIndex = 0
        let placed = false

        while (!placed) {
          const col = columns[columnIndex] || []
          if (col.length === 0) {
            columns[columnIndex] = col
            placed = true
          } else {
            const overlaps = col.some((c) =>
              areIntervalsOverlapping(
                { start: adjustedStart, end: adjustedEnd },
                {
                  start: new Date(c.event.start),
                  end: new Date(c.event.end),
                },
              ),
            )
            if (!overlaps) {
              placed = true
            } else {
              columnIndex++
            }
          }
        }

        const currentColumn = columns[columnIndex] || []
        columns[columnIndex] = currentColumn
        currentColumn.push({ event, end: adjustedEnd })

        const width = columnIndex === 0 ? 1 : 0.9
        const left = columnIndex === 0 ? 0 : columnIndex * 0.1

        positionedEvents.push({
          event,
          top,
          height,
          left,
          width,
          zIndex: 10 + columnIndex,
        })
      })

      return positionedEvents
    })

    return result
  }, [days, events])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const showAllDaySection = allDayEvents.length > 0
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "week")

  return (
    <div data-slot="week-view" className="flex h-full flex-col">
      <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-[3.5rem_repeat(7,1fr)] sm:grid-cols-[4.5rem_repeat(7,1fr)] border-y backdrop-blur-md uppercase">
        <div className="text-muted-foreground/70 py-1 sm:py-2 text-center text-[9px] sm:text-xs">
          <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="data-today:text-foreground text-muted-foreground/70 py-1 sm:py-2 text-center text-[9px] sm:text-xs data-today:font-medium"
            data-today={isToday(day) || undefined}
          >
            <span className="sm:hidden" aria-hidden="true">
              {format(day, "E")[0]} {format(day, "d")}
            </span>
            <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
          </div>
        ))}
      </div>

      {showAllDaySection && (
        <div className="border-border/70 bg-muted/50 border-b">
          <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] sm:grid-cols-[4.5rem_repeat(7,1fr)]">
            <div className="border-border/70 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-4 sm:h-6 w-12 sm:w-16 max-w-full pe-2 sm:pe-3 text-right text-[9px] sm:text-xs">
                All day
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                return isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)
              })

              return (
                <DroppableCell
                  key={day.toString()}
                  id={`week-all-day-cell-${day.toISOString()}`}
                  date={day}
                  onClick={() => {
                    const startTime = new Date(day)
                    startTime.setHours(StartHour, 0, 0)
                    onEventCreate(startTime)
                  }}
                  className="border-border/70 relative border-r p-0.5 sm:p-1 last:border-r-0"
                >
                  {dayAllDayEvents.map((event) => {
                    const eventStart = new Date(event.start)
                    const eventEnd = new Date(event.end)
                    const isFirstDay = isSameDay(day, eventStart)
                    const isLastDay = isSameDay(day, eventEnd)

                    return (
                      <EventItem
                        key={event.id}
                        event={event}
                        view="week"
                        onClick={(e) => handleEventClick(event, e)}
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      />
                    )
                  })}
                </DroppableCell>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] sm:grid-cols-[4.5rem_repeat(7,1fr)]">
          <div className="border-border/70 relative border-r">
            {hours.map((hour) => (
              <div key={hour.toString()} className="border-border/70 relative h-[var(--week-cells-height)] border-b">
                <div className="text-muted-foreground/70 absolute -top-4 right-0 w-12 sm:w-14 max-w-full pe-2 sm:pe-3 text-right text-[9px] sm:text-xs">
                  {format(hour, "h a")}
                </div>
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={day.toString()} className="relative">
              {hours.map((hour, hourIndex) => {
                const cellId = `week-cell-${day.toISOString()}-${hour.toISOString()}`
                return (
                  <DroppableCell
                    key={hour.toString()}
                    id={cellId}
                    date={new Date(day.setHours(hour.getHours()))}
                    onClick={() => {
                      const startTime = new Date(day)
                      startTime.setHours(hour.getHours(), 0, 0)
                      onEventCreate(startTime)
                    }}
                    className={cn(
                      "border-border/70 relative h-[var(--week-cells-height)] border-b border-r last:border-r-0",
                      hourIndex === hours.length - 1 && "border-b-0",
                    )}
                  />
                )
              })}

              {processedDayEvents[dayIndex]?.map((positionedEvent) => {
                const { event, top, height, left, width, zIndex } = positionedEvent
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)
                const isFirstDay = isSameDay(day, eventStart)
                const isLastDay = isSameDay(day, eventEnd)

                return (
                  <div
                    key={event.id}
                    className="absolute px-0.5"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `${left * 100}%`,
                      width: `${width * 100}%`,
                      zIndex,
                    }}
                  >
                    <DraggableEvent
                      event={event}
                      view="week"
                      onClick={(e) => handleEventClick(event, e)}
                      isFirstDay={isFirstDay}
                      isLastDay={isLastDay}
                    />
                  </div>
                )
              })}

              {currentTimeVisible && dayIndex === currentTimePosition.dayIndex && (
                <div
                  className="bg-primary absolute left-0 right-0 h-0.5 -translate-y-1/2 z-50"
                  style={{ top: currentTimePosition.top }}
                >
                  <div className="bg-primary absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
