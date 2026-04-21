import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym AI Coach — Your pocket personal trainer",
  description:
    "Gym AI Coach is a premium mobile fitness app mockup: workouts, nutrition, progress tracking and an AI coach that actually listens.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-ink-950">
      <body className="min-h-screen bg-ink-950 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
