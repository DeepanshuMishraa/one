import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import BigCalendar from "@/components/big-calendar";


export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
          <BigCalendar />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

