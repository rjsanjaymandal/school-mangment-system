import { CreditCard, FileText, Receipt, UserCheck, ArrowRight, Printer, Download } from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { Badge } from "@/components/ui/badge";

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
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-l-blue-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-l-purple-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-500" },
};

export default function DownloadCenterPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
                    <Printer className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Download Center</h1>
                    <p className="text-sm text-slate-500">Generate and print documents</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                    const colors = colorClasses[module.color];
                    return (
                        <Link key={module.title} href={module.href}>
                            <div className={`bg-white border border-slate-200 rounded-md shadow-sm border-l-4 ${colors.border} hover:shadow-md transition-shadow h-full`}>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-3 rounded-md ${colors.bg}`}>
                                            <module.icon className={`h-6 w-6 ${colors.text}`} />
                                        </div>
                                        <Badge variant="outline" className="text-xs">{module.stats}</Badge>
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        {module.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                        Open <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="bg-slate-900 rounded-md p-6 text-white">
                <div className="max-w-2xl">
                    <h4 className="text-lg font-semibold mb-2">Print Optimized</h4>
                    <p className="text-slate-400 text-sm mb-4">
                        All documents are generated from real-time institutional records with high-fidelity formatting.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md text-sm">
                            <Printer className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs">Verified Records</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md text-sm">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span className="text-xs">PDF Export</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}