"use client";

import { cn } from "@/lib/utils";

interface StudentAvatarProps {
  name?: string;
  classId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
];

export function StudentAvatar({ name, classId, className, size = "md" }: StudentAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Deterministic color based on classId or name
  const hash = (classId || name || "default").split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colorClass = COLORS[Math.abs(hash) % COLORS.length];

  const sizeClass = SIZES[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center font-black text-white rounded-2xl shadow-sm transition-transform duration-500 shrink-0",
        colorClass,
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
