import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccentColor = "emerald" | "blue" | "amber" | "red" | "purple" | "slate";

interface ERPCardProps {
  title?: string;
  icon?: ReactNode;
  color?: AccentColor;
  accentColor?: AccentColor;
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
  slate: "border-l-slate-400",
};

const iconBgClasses: Record<AccentColor, string> = {
  emerald: "bg-emerald-50",
  blue: "bg-blue-50",
  amber: "bg-amber-50",
  red: "bg-red-50",
  purple: "bg-purple-50",
  slate: "bg-slate-100",
};

const iconColorClasses: Record<AccentColor, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  red: "text-red-600",
  purple: "text-purple-600",
  slate: "text-slate-600",
};

export function ERPCard({
  title,
  icon,
  color,
  accentColor,
  description,
  action,
  children,
  className,
}: ERPCardProps) {
  const activeColor = accentColor || color || "emerald";
  
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden",
        colorClasses[activeColor],
        className
      )}
    >
      {(title || icon) && (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn("p-1.5 rounded", iconBgClasses[activeColor], iconColorClasses[activeColor])}>
                {icon}
              </div>
            )}
            {title && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                {description && <p className="text-xs text-slate-500">{description}</p>}
              </div>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}