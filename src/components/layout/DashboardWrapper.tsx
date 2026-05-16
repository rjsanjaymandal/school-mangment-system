"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col min-h-screen bg-slate-50 transition-all duration-300",
        !mounted ? "md:pl-64" : (isCollapsed ? "md:pl-20" : "md:pl-64")
      )}
    >
      {children}
    </div>
  );
}
