import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import appCss from "@/styles/app.css?url"
import { ThemeProvider } from '@/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import NotFound from "@/components/NotFound"

const themeScript = `
  let theme = localStorage.getItem("vite-ui-theme") || "dark";
  
  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  
  document.documentElement.classList.add(theme);
`;

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
        title: 'One',
        description: 'One | Chat with your calendar',
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    // Add the script to run before any content is displayed  
    script: [
      {
        dangerouslySetInnerHTML: {
          __html: themeScript
        }
      }
    ]
  }),
  component: RootComponent,
  notFoundComponent: () => <NotFound />
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="vite-ui-theme"
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
