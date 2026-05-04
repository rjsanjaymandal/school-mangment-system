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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="p-3 bg-emerald-50 rounded-md">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {title}
            </h1>
            {badge && (
              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs font-medium"
              >
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
