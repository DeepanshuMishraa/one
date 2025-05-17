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
