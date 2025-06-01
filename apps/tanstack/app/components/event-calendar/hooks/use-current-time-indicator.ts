"use client";

import { useEffect, useState } from "react";
import { endOfWeek, isSameDay, isWithinInterval, startOfWeek } from "date-fns";
import { StartHour, EndHour } from "@/components/event-calendar/constants";
import { WeekCellsHeight } from "@/components/event-calendar";

interface TimePosition {
  top: number;
  dayIndex?: number;
}

export function useCurrentTimeIndicator(
  currentDate: Date,
  view: "day" | "week",
) {
  const [currentTimePosition, setCurrentTimePosition] = useState<TimePosition>({ top: 0 });
  const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const hoursSinceStart = hours - StartHour + minutes / 60;
      const top = hoursSinceStart * WeekCellsHeight;

      let isCurrentTimeVisible = false;
      let dayIndex: number | undefined = undefined;

      if (view === "day") {
        isCurrentTimeVisible = isSameDay(now, currentDate);
      } else if (view === "week") {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        isCurrentTimeVisible = isWithinInterval(now, {
          start: startOfWeekDate,
          end: endOfWeekDate,
        });

        if (isCurrentTimeVisible) {
          const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
          dayIndex = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        }
      }

      setCurrentTimePosition({ top, dayIndex });
      setCurrentTimeVisible(isCurrentTimeVisible);
    };

    calculateTimePosition();

    const interval = setInterval(calculateTimePosition, 60000);

    return () => clearInterval(interval);
  }, [currentDate, view]);

  return { currentTimePosition, currentTimeVisible };
}
