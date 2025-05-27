"use client";

import { useEffect, useState } from "react";
import { useCalendarContext } from "@/components/event-calendar/calendar-context";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SidebarCalendarProps {
  className?: string;
}

export default function SidebarCalendar({ className }: SidebarCalendarProps) {

  const { currentDate, setCurrentDate } = useCalendarContext();
  const [calendarMonth, setCalendarMonth] = useState<Date>(currentDate);

  useEffect(() => {
    setCalendarMonth(currentDate);
  }, [currentDate]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={handleSelect}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        classNames={{
          day_button:
            "transition-none! hover:not-in-data-selected:bg-sidebar-accent group-[.range-middle]:group-data-selected:bg-sidebar-accent text-sidebar-foreground",
          today: "*:after:transition-none",
          outside: "data-selected:bg-sidebar-accent/50",
        }}
      />
    </div>
  );
}
