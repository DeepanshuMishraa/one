"use client"

import { useEffect, useMemo, useState } from "react"
import { format, isBefore } from "date-fns"
import { X, Clock, CalendarIcon, FileText, MapPin, Trash2 } from "lucide-react"

import type { CalendarEvent, EventColor } from "@/components/event-calendar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { StartHour, EndHour, DefaultStartHour, DefaultEndHour } from "@/components/event-calendar/constants"

interface EventSidebarProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventSidebar({ event, isOpen, onClose, onSave, onDelete }: EventSidebarProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("blue")
  const [error, setError] = useState<string | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")

      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(start)
      setEndDate(end)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay || false)
      setLocation(event.location || "")
      setColor((event.color as EventColor) || "blue")
      setError(null)
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate(new Date())
    setEndDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setAllDay(false)
    setLocation("")
    setColor("blue")
    setError(null)
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "h:mm a")
        options.push({ value, label })
      }
    }
    return options
  }, [])

  const handleSave = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number)
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number)

      if (startHours < StartHour || startHours > EndHour || endHours < StartHour || endHours > EndHour) {
        setError(`Selected time must be between ${StartHour}:00 and ${EndHour}:00`)
        return
      }

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    if (isBefore(end, start)) {
      setError("End date cannot be before start date")
      return
    }

    const eventTitle = title.trim() ? title : "Untitled Event"

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
    })
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  const colorOptions: Array<{
    value: EventColor
    label: string
    className: string
    preview: string
  }> = [
      {
        value: "blue",
        label: "Blue",
        className: "bg-gradient-to-r from-blue-500 to-blue-600",
        preview: "Perfect for work meetings and professional events",
      },
      {
        value: "violet",
        label: "Violet",
        className: "bg-gradient-to-r from-violet-500 to-purple-600",
        preview: "Great for creative projects and brainstorming",
      },
      {
        value: "emerald",
        label: "Emerald",
        className: "bg-gradient-to-r from-emerald-500 to-green-600",
        preview: "Ideal for health, fitness, and nature activities",
      },
      {
        value: "rose",
        label: "Rose",
        className: "bg-gradient-to-r from-rose-500 to-pink-600",
        preview: "Perfect for personal events and celebrations",
      },
      {
        value: "orange",
        label: "Orange",
        className: "bg-gradient-to-r from-orange-500 to-amber-600",
        preview: "Great for social events and networking",
      },
    ]

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const date = new Date(2000, 0, 1, hours, minutes)
    return format(date, "h:mm a")
  }

  const formatDisplayDate = (date: Date) => {
    return format(date, "EEE d MMM")
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] md:w-[420px] bg-background border-l shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="text-base sm:text-lg font-medium border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
            />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 ml-2 sm:ml-4 flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
            {error && <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-xs sm:text-sm">{error}</div>}

            {/* Time Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="h-4 w-4" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {!allDay ? (
                    <>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="border-none shadow-none p-0 h-auto w-auto font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs sm:text-sm">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="">→</span>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger className="border-none shadow-none p-0 h-auto w-auto font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs sm:text-sm">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <span className="font-medium">All day</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <CalendarIcon className="h-4 w-4" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium hover:bg-transparent">
                        {formatDisplayDate(startDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date)
                            setStartDateOpen(false)
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {!allDay && <span>→</span>}
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium hover:bg-transparent">
                        {formatDisplayDate(endDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          if (date) {
                            setEndDate(date)
                            setEndDateOpen(false)
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="all-day"
                  checked={allDay}
                  onCheckedChange={(checked) => setAllDay(checked as boolean)}
                  className="h-4 w-4"
                />
                <label htmlFor="all-day" className="text-xs sm:text-sm font-medium leading-none">
                  All day
                </label>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="h-4 w-4" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-4 w-4" />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description"
                  className="text-xs sm:text-sm min-h-[100px]"
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-3">
              <RadioGroup value={color} onValueChange={(value) => setColor(value as EventColor)} className="grid grid-cols-2 gap-2">
                {colorOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2 sm:p-3 cursor-pointer transition-colors",
                      color === option.value && "border-primary bg-primary/5",
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <div className={cn("h-4 w-4 rounded-full", option.className)} />
                    <div className="space-y-0.5">
                      <div className="text-xs sm:text-sm font-medium">{option.label}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{option.preview}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-t bg-background/95 backdrop-blur-sm">
            {event?.id ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="text-xs sm:text-sm h-8 sm:h-9">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="text-xs sm:text-sm h-8 sm:h-9">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
