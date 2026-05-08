import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

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

import { getAuthContext } from "@/lib/auth-context";
import { ImpersonationBanner } from "@/components/shared/ImpersonationBanner";
import { AIAssistant } from "@/components/ai";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isImpersonating, effectiveUser, effectiveRole } = await getAuthContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        {isImpersonating && (
          <ImpersonationBanner 
            targetName={effectiveUser?.full_name || "Unknown"} 
            targetRole={effectiveRole || "unknown"}
          />
        )}
        <ReactQueryProvider>
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
          <Toaster />
          <AIAssistant />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

