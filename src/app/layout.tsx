import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Work_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";

const ws = Work_Sans({
  subsets: ["latin"],
  variable: "--font-ws",
})

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
      }
    ],
  },
  authors: [{ name: "Deepanshu Mishra", url: "https://deepanshumishra.xyz" }, { name: "One", url: "https://one.deepanshumishra.xyz" }],
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
    "google calendar"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ws.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
