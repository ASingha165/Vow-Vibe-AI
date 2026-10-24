import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vow & Vibe AI — Your Vision. Your Budget. Your Perfect Event.",
  description:
    "An intelligent luxury celebration and event-planning web application. Plan weddings, birthdays, anniversaries, festivals, and cultural gatherings with deterministic budgeting, interactive timelines, and Gemini AI intelligence.",
  keywords: [
    "AI event planner",
    "wedding budget calculator",
    "Bengali wedding planner",
    "event timeline generator",
    "Vow and Vibe",
    "PromptWars",
  ],
  authors: [{ name: "Vow & Vibe AI Architecture Team" }],
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FEF8F3] text-[#1D1B19]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
