import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Appbar from "@/components/Appbar";
import { ThemeProvider } from "@/providers/theme-provider";
const calSans = localFont({
  src: "./fonts/CalSans-Regular.ttf"
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
        className={`${calSans.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Appbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
