'use client'

import { useQuery } from "@tanstack/react-query"
import { getCalendarEvents } from "../../../../actions/actions"
import { Button } from "@/components/ui/button";

export default function Page() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await getCalendarEvents();
      console.log(res);
      return res.events;
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl">Error: {error.message}</p>
      </div>
    )
  }
  return (
    <div>
      {data?.map(() => {
        return (
          <div key={Math.random()} className="flex items-center justify-center h-screen">
            <p className="text-2xl">Event</p>
          </div>
        )
      })}
    </div>
  )
}
