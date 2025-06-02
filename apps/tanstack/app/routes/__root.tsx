import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import appCss from "@/styles/app.css?url"
import { getThemeServerFn } from '@/lib/theme'
import { ThemeProvider, useTheme } from '@/providers/theme-provider'
import QueryProvideR from '@/providers/query-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Chat with your calendar | One',
        description: "One is an AI Powered Calendar Assistant that allows you to chat with your calendar. It helps you manage your schedule, find time for meetings, and even book appointments. One is designed to be your personal assistant, making it easier to stay organized and on top of your tasks.One is a perfect Opensource Alternative to Google Calendar.",
        keywords: "One, AI, Calendar, Assistant, Google Calendar, Opensource, Personal Assistant, Schedule, Meetings, Book Appointments, Stay Organized, Task Management, AI Powered, Chat with your calendar, One is an AI Powered Calendar Assistant that allows you to chat with your calendar. It helps you manage your schedule, find time for meetings, and even book appointments. One is designed to be your personal assistant, making it easier to stay organized and on top of your tasks.One is a perfect Opensource Alternative to Google Calendar.",
        icon: "/favicon.ico"
      },

    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ]
  }),
  component: RootComponent,
  loader: () => getThemeServerFn(),
})

function RootComponent() {
  const data = Route.useLoaderData();
  return (
    <ThemeProvider theme={data}>
      <QueryProvideR>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </QueryProvideR>
    </ThemeProvider>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();
  return (
    <html className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
