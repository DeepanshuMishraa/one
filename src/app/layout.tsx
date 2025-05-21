import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { CalendarProvider } from "@/components/event-calendar/calendar-context";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { TRPCProvider } from "@/trpc/client";
import QueryProvideR from "@/providers/providers";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "One",
  description: "Chat with your calendar | One",
  openGraph: {
    title: "One",
    description: "Chat with your calendar | One",
    url: "https://one.deepanshumishra.xyz",
    siteName: "One",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://one.deepanshumishra.xyz/og.png",
        width: 800,
        height: 600,
        alt: "One",
      },
    ],
  },
  authors: [
    { name: "Deepanshu Mishra", url: "https://deepanshumishra.xyz" },
    { name: "One", url: "https://one.deepanshumishra.xyz" },
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
    images: ["https://one.deepanshumishra.xyz/og.png"],
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


const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-sidebar font-sans antialiased`}
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
