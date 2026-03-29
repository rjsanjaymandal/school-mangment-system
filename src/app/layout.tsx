import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import { Metadata } from "next";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Edu Maysan | Professional School Management System",
  description: "A comprehensive, dynamic school ERP for managing students, teachers, exams, and attendance with real-time analytics.",
  openGraph: {
    title: "Edu Maysan ERP",
    description: "Enterprise-grade school management platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

