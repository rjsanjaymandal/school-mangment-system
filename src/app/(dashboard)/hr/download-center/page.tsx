import { CreditCard, FileText, Receipt, UserCheck, ArrowRight, Printer, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const modules = [
    {
        title: "Admit Cards",
        description: "Generate exam hall tickets for students by class.",
        icon: UserCheck,
        href: "/hr/download-center/admit-cards",
        color: "blue",
        stats: "Ready"
    },
    {
        title: "ID Cards",
        description: "Create CR80 sized ID cards for students and staff.",
        icon: CreditCard,
        href: "/hr/download-center/id-cards",
        color: "emerald",
        stats: "Ready"
    },
    {
        title: "Certificates",
        description: "Generate bonafide, transfer, and character certificates.",
        icon: FileText,
        href: "/hr/download-center/certificates",
        color: "purple",
        stats: "Ready"
    },
    {
        title: "Fee Receipts",
        description: "Print fee payment receipts for parents and students.",
        icon: Receipt,
        href: "/hr/download-center/fee-receipts",
        color: "amber",
        stats: "Ready"
    },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400", border: "border-l-blue-500" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-l-emerald-500" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500" },
};

export default function DownloadCenterPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border-l-4 border-emerald-500">
                    <Printer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Download Center</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Generate and print documents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                    const colors = colorClasses[module.color];
                    return (
                        <Link key={module.title} href={module.href}>
                            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm border-l-4 ${colors.border} hover:shadow-md transition-shadow h-full`}>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                                            <module.icon className={`h-6 w-6 ${colors.text}`} />
                                        </div>
                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                                            {module.stats}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-2">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                        {module.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-black">
                                        Open <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white">
                <div className="max-w-2xl">
                    <h4 className="text-lg font-black tracking-tight mb-2">Print Optimized</h4>
                    <p className="text-slate-400 text-sm mb-4">
                        All documents are generated from real-time institutional records with high-fidelity formatting.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-sm">
                            <Printer className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-black">Verified Records</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-sm">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-black">PDF Export</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
