import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CIVOARA: Municipal Service Resolution Platform",
  description:
    "Municipal work order tracking, PostGIS geospatial ward routing, deterministic SLA enforcement, and public department performance auditing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${sans.variable} ${mono.variable}`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
