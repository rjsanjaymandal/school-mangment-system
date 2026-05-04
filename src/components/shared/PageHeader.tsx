import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  badge,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="flex items-start gap-x-5">
        {icon && (
          <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-xl soft-shadow-md">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-x-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <Badge
                variant="outline"
                className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
              >
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        {children}
      </div>
    </div>
  );
}
