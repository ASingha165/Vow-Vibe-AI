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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-[#22092C]">
        {children}
      </body>
    </html>
  );
}
