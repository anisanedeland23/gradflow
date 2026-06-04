import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { FocusFlightProvider } from "@/components/FocusFlightProvider";
import FloatingFocusFlight from "@/components/FloatingFocusFlight";
import FlyingPlaneMotivation from "@/components/FlyingPlaneMotivation";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "GradFlow",
  description:
    "Academic productivity dashboard for tasks, thesis, internship, goals, assets, and focus sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthGate>
            <FocusFlightProvider>
              {children}
              <FloatingFocusFlight />
              <FlyingPlaneMotivation />
            </FocusFlightProvider>
          </AuthGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
