import { 
    CreditCard, 
    FileText, 
    Receipt, 
    UserCheck, 
    ArrowRight,
    Printer,
    Download
} from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { Button } from "@/components/ui/button";

const modules = [
    {
        title: "Admit Card Generator",
        description: "Generate and print exam hall tickets for students by class and section.",
        icon: UserCheck,
        href: "/hr/download-center/admit-cards",
        color: "blue",
        stats: "Exam Hall Tickets"
    },
    {
        title: "Identity Card Generator",
        description: "Create professional CR80 sized ID cards for students and staff members.",
        icon: CreditCard,
        href: "/hr/download-center/id-cards",
        color: "emerald",
        stats: "Student & Staff IDs"
    },
    {
        title: "Certificate Creator",
        description: "Issue Transfer, Character, and Merit certificates with dynamic templates.",
        icon: FileText,
        href: "/hr/download-center/certificates",
        color: "amber",
        stats: "TC & Certificates"
    },
    {
        title: "Fee Receipt Archive",
        description: "Search and reprint professional fee receipts for all transactions.",
        icon: Receipt,
        href: "/hr/download-center/fee-receipts",
        color: "indigo",
        stats: "Transaction Receipts"
    }
];

export default function DownloadCenterPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 p-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Printer className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Download Center</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1 italic">Institutional Generation & Archive</p>
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Ready</span>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((module) => (
                    <Link key={module.title} href={module.href}>
                        <ERPCard 
                            accentColor={module.color as any}
                            className="group hover:shadow-xl transition-all duration-500 cursor-pointer border-transparent hover:border-slate-200 dark:hover:border-slate-800 h-full"
                        >
                            <div className="p-2">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-4 rounded-2xl bg-${module.color}-50 dark:bg-${module.color}-900/20 group-hover:scale-110 transition-transform duration-500`}>
                                        <module.icon className={`h-8 w-8 text-${module.color}-600`} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Badge className={`bg-${module.color}-100 text-${module.color}-700 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                                            {module.stats}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 italic">
                                    {module.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                    {module.description}
                                </p>
                                
                                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Open Sub-Module <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </ERPCard>
                    </Link>
                ))}
            </div>

            {/* Footer Stats/Info */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Printer className="h-40 w-40" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h4 className="text-xl font-black italic tracking-tight mb-4">Print Optimized Experience</h4>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8">
                        Our generation engine uses high-fidelity CSS templates designed specifically for A4 and CR80 thermal printing. 
                        All documents are dynamically generated from real-time institutional records.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-bold tracking-tight">Verified Records</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-bold tracking-tight">PDF Export Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
