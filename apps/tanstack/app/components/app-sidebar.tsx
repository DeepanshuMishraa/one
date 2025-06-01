"use client";

import * as React from "react";
import Link from "next/link";
import { RiCheckLine } from "@remixicon/react";
import { trpc } from "@repo/trpc/client";
import type { Calendar } from "@repo/types";
import { useCalendarStore } from "@/components/big-calendar";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarCalendar from "@/components/sidebar-calendar";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: calendarData } = trpc.calendar.getCalendars.useQuery();
  const { activeCalendars, toggleCalendar } = useCalendarStore();

  return (
    <Sidebar
      variant="inset"
      {...props}
      className="scheme-only-dark max-lg:p-2 lg:pe-1"
    >
      <SidebarHeader className="p-2 sm:p-4">
        <div className="flex justify-between items-center gap-2">
          <Link className="inline-flex" href="/">
            <span className="sr-only">One</span>
            <Image
              src="/logo.svg"
              alt="One"
              width={28}
              height={28}
              className="sm:w-8 sm:h-8"
            />
          </Link>
          <SidebarTrigger className="text-muted-foreground/80 hover:text-foreground/80 hover:bg-transparent! h-7 w-7 sm:h-8 sm:w-8" />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t px-2 sm:px-0">
        <SidebarGroup className="px-1">
          <SidebarCalendar />
        </SidebarGroup>
        <SidebarGroup className="px-1 mt-2 sm:mt-3 pt-3 sm:pt-4 border-t">
          <SidebarGroupLabel className="uppercase text-muted-foreground/65 text-xs sm:text-sm">
            My Calendars
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calendarData?.calendars.map((calendar: Calendar) => (
                <SidebarMenuItem key={calendar.id}>
                  <SidebarMenuButton
                    asChild
                    className="relative rounded-md [&>svg]:size-auto justify-between has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px] py-2 sm:py-2.5"
                  >
                    <span>
                      <span className="font-medium flex items-center justify-between gap-2 sm:gap-3">
                        <Checkbox
                          id={calendar.id}
                          className="sr-only peer"
                          checked={activeCalendars.find((cal: { id: string }) => cal.id === calendar.id)?.isActive ?? true}
                          onCheckedChange={() => toggleCalendar(calendar.id)}
                        />
                        <RiCheckLine
                          className="peer-not-data-[state=checked]:invisible"
                          size={14}
                          aria-hidden="true"
                        />
                        <label
                          htmlFor={calendar.id}
                          className="peer-not-data-[state=checked]:line-through peer-not-data-[state=checked]:text-muted-foreground/65 after:absolute after:inset-0 text-xs sm:text-sm truncate flex-1"
                        >
                          {calendar.summary}
                        </label>
                      </span>
                      <span
                        className="size-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: calendar.backgroundColor }}
                      ></span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 sm:p-4">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
