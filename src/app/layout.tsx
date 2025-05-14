import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Appbar from "@/components/Appbar";

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
    <html lang="en">
      <body
        className={`${calSans.className} antialiased`}
      >
        <Appbar />
        {children}
      </body>
    </html>
  );
}
