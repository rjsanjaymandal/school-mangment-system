"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed, width } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking near the sidebar edge
      if (e.clientX >= width - 10 && e.clientX <= width + 10) {
        setIsResizing(true);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [width]);

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col min-h-screen bg-slate-50",
        isResizing ? "transition-none" : "transition-all duration-300"
      )}
      style={{ 
        paddingLeft: !mounted ? 256 : (isCollapsed ? 80 : width) 
      }}
    >
      {children}
    </div>
  );
}
