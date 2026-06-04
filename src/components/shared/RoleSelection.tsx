"use client";

import { useRouter } from "next/navigation";
import { 
    ShieldCheck, 
    BookOpen, 
    GraduationCap, 
    Wallet, 
    UserRound, 
    History,
    ArrowRight,
    Search,
    Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
    {
        id: "admin",
        title: "Admin",
        description: "Full institutional control, security protocols, and advanced analytics.",
        icon: ShieldCheck,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        border: "border-blue-100 dark:border-blue-900/30",
    },
    {
        id: "teacher",
        title: "Educator",
        description: "Academic management, student progress tracking, and curriculum tools.",
        icon: BookOpen,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-100 dark:border-emerald-900/30",
    },
    {
        id: "student",
        title: "Student",
        description: "Learning resources, exam schedules, and personal performance data.",
        icon: GraduationCap,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/10",
        border: "border-indigo-100 dark:border-indigo-900/30",
    },
    {
        id: "parent",
        title: "Guardian",
        description: "Monitor child's attendance, fee schedules, and institutional notices.",
        icon: UserRound,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/10",
        border: "border-rose-100 dark:border-rose-900/30",
    },
    {
        id: "accountant",
        title: "Accounts",
        description: "Financial records management, fee collection, and payroll auditing.",
        icon: Wallet,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        border: "border-amber-100 dark:border-amber-900/30",
    },
    {
        id: "receptionist",
        title: "Front Office",
        description: "School inquiries, visitor registration, and admin support.",
        icon: Monitor,
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-900/10",
        border: "border-slate-100 dark:border-slate-800/30",
    }
];

export function RoleSelection() {
    const router = useRouter();

    const handleRoleSelect = (roleId: string) => {
        router.push(`/login?role=${roleId}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Background Decoration - Minimalist Softness */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-[160px]" />
            </div>

            <div className="w-full max-w-6xl relative z-10 space-y-20 page-fade-in">
                {/* Header - Editorial Style */}
                <div className="text-center space-y-8 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-x-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System Access</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                            Edu <span className="text-blue-600">Maysan</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                            A refined portal for academic excellence. Select your school role to proceed.
                        </p>
                    </div>
                </div>

                {/* Role Grid - Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className={cn(
                                "group relative flex flex-col items-start p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 transition-all duration-500 text-left overflow-hidden",
                                "hover:border-blue-500/30 hover:soft-shadow-lg hover:-translate-y-1"
                            )}
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 dark:to-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className={cn(
                                "relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 shadow-sm",
                                role.bg,
                                role.color
                            )}>
                                <role.icon className="h-8 w-8" />
                            </div>
                            
                            <div className="relative z-10 space-y-3 w-full">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-between">
                                    {role.title}
                                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-blue-600" />
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {role.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer - Subtle Trust Signals */}
                <div className="flex flex-col items-center gap-y-6 pt-10">
                    <div className="h-px w-24 bg-slate-100 dark:bg-slate-800" />
                    <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
                        School Management System v4.5
                    </p>

                </div>
            </div>
        </div>
    );
}
