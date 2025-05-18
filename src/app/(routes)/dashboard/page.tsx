import CalendarComponent from "@/components/calendar";

/**
 * Renders the dashboard page with a styled container displaying the calendar component.
 */
export default function Dashboard() {
  return (
    <div className="rounded-2xl m-6 h-[100svh] bg-gray-900/15">
      <CalendarComponent />
    </div>
  )
}
