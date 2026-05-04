import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentColor = "emerald" | "blue" | "amber" | "red" | "purple" | "slate";

interface ERPCardProps {
  title: string;
  icon?: ReactNode;
  color?: AccentColor;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const colorClasses: Record<AccentColor, string> = {
  emerald: "border-l-emerald-500",
  blue: "border-l-blue-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
  purple: "border-l-purple-500",
  slate: "border-l-slate-500",
};

const iconColorClasses: Record<AccentColor, string> = {
  emerald: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
  amber: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50",
  purple: "text-purple-600 bg-purple-50",
  slate: "text-slate-600 bg-slate-100",
};

export function ERPCard({
  title,
  icon: Icon,
  color = "emerald",
  description,
  action,
  children,
  className,
}: ERPCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden",
        colorClasses[color],
        className
      )}
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "p-2 rounded-md",
                iconColorClasses[color]
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}