
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface UnifiedPageHeaderProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    color?: "emerald" | "blue" | "rose" | "amber" | "purple" | "indigo";
    actions?: ReactNode;
    className?: string;
}

export function UnifiedPageHeader({
    title,
    subtitle,
    icon: Icon,
    color = "emerald",
    actions,
    className
}: UnifiedPageHeaderProps) {
    const iconColors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5",
        blue: "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5",
        rose: "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/5",
        amber: "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5",
        purple: "bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-purple-500/5",
        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-indigo-500/5",
    };

    return (
        <div className={cn(
            "flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-700",
            className
        )}>
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-xl border shadow-sm",
                    iconColors[color]
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
