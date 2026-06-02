import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { FocusFlightProvider } from "@/components/FocusFlightProvider";
import FloatingFocusFlight from "@/components/FloatingFocusFlight";
import FlyingPlaneMotivation from "@/components/FlyingPlaneMotivation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GradFlow",
  description: "GradFlow productivity dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} theme-light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <FocusFlightProvider>
            {children}
            <FloatingFocusFlight />
            <FlyingPlaneMotivation />
          </FocusFlightProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
