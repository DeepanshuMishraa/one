import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import "./globals.css";
import { Metadata } from "next";
import QueryProvideR from "providers/providers";
import { ThemeProvider } from "providers/theme-provider";
import { ToastProvider } from "components/ui/toast";
import { TRPCProvider } from "@repo/trpc/client";
import localFont from "next/font/local";
export const metadata: Metadata = {
  title: "One",
  description: "One is an AI Powered Calendar Assistant that allows you to chat with your calendar. It helps you manage your schedule, find time for meetings, and even book appointments. One is designed to be your personal assistant, making it easier to stay organized and on top of your tasks.One is a perfect Opensource Alternative to Google Calendar.",
  openGraph: {
    title: "One",
    description: "Chat with your calendar | One",
    url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    siteName: "One",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/ogx.png`,
        width: 800,
        height: 600,
        alt: "One",
      },
    ],
  },
  authors: [
    { name: "Deepanshu Mishra", url: "https://deepanshumishra.xyz" },
    { name: "One", url: `${process.env.NEXT_PUBLIC_APP_URL}` },
  ],
  keywords: [
    "One",
    "Talk to calendar",
    "One AI Calendar",
    "AI calendar",
    "chat with calendar",
    "ycombinator",
    "deepanshu mishra",
    "nextjs",
    "zero.email",
    "zero",
    "0.email",
    "google calendar",
  ],
  twitter: {
    card: "summary_large_image",
    title: "One",
    description: "Chat with your calendar | One",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/ogx.png`],
    creator: "@deepanshuDipxsy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};


const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.ttf"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${satoshi.className} bg-sidebar font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            <ToastProvider>
              <QueryProvideR>
                <CalendarProvider>{children}</CalendarProvider>
              </QueryProvideR>
            </ToastProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
