"use client";

import { useMemo, useState } from "react";
import {
    Award,
    ShieldCheck,
    GraduationCap,
    Star,
    BookOpen,
    Search,
    Plus,
    Trash2,
    Shield,
    Activity,
} from "lucide-react";
import { 
    AreaChart, Area, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { issueCertificate, revokeCertificate } from "@/app/actions/certificates";
import { Student } from "@/types/database";

export default function CertificatesDashboardClient({ 
    initialCertificates,
    students,
    userRole
}: { 
    initialCertificates: any[],
    students: Student[],
    userRole?: string | null
}) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const [certificates, setCertificates] = useState(initialCertificates);

    const filteredCertificates = certificates.filter((cert) =>
        cert.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.student?.profile?.first_name && cert.student.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cert.student?.profile?.last_name && cert.student.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const issuanceStats = useMemo(() => ({
        total: certificates.length,
        issued: certificates.filter(c => c.status === "issued" || c.status !== "revoked").length,
        revoked: certificates.filter(c => c.status === "revoked").length,
        types: [...new Set(certificates.map(c => c.type))].length,
    }), [certificates]);

    const issuanceTrends = useMemo(() => {
        const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
        const monthBuckets = new Map<string, { name: string; Issued: number; Revoked: number }>();

        certificates.forEach((certificate) => {
            const dateStr = certificate.issued_date || certificate.created_at;
            if (!dateStr) return;
            const month = formatter.format(new Date(dateStr));
            const bucket = monthBuckets.get(month) || { name: month, Issued: 0, Revoked: 0 };

            if (certificate.status === "revoked") {
                bucket.Revoked += 1;
            } else {
                bucket.Issued += 1;
            }

            monthBuckets.set(month, bucket);
        });

        return Array.from(monthBuckets.values());
    }, [certificates]);

    const certTypes = useMemo(() => {
        const counts: Record<string, number> = {};
        certificates.forEach(c => {
            const type = c.type || "General";
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [certificates]);

    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    const handleIssue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsIssuing(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            const result = await issueCertificate({
                student_id: formData.get("student_id") as string,
                type: formData.get("type") as string,
                remarks: formData.get("notes") as string
            });

            if (result.success) {
                toast.success(result.message);
                setShowIssueModal(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to issue certificate");
        } finally {
            setIsIssuing(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this certificate?")) return;
        
        try {
            const result = await revokeCertificate(id);
            if (result.success) {
                toast.success(result.message);
                setCertificates(prev => prev.map((certificate) => (
                    certificate.id === id
                        ? { ...certificate, status: "revoked" }
                        : certificate
                )));
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to revoke certificate");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <UnifiedPageHeader
                title="Certificates"
                subtitle="Student certificates and recognition"
                icon={Award}
                color="emerald"
                actions={isAdminOrTeacher ? (
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Issue Certificate
                    </button>
                ) : undefined}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Issued" value={issuanceStats.total} icon={Award} color="emerald" description="All certificates" />
                <DashboardStatCard title="Active" value={issuanceStats.issued} icon={ShieldCheck} color="blue" description="Currently valid" />
                <DashboardStatCard title="Revoked" value={issuanceStats.revoked} icon={Trash2} color="rose" description="Revoked certificates" />
                <DashboardStatCard title="Types" value={issuanceStats.types} icon={BookOpen} color="purple" description="Certificate categories" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full relative z-10">
                <div className="md:col-span-8 bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    Issuance <span className="text-emerald-600">Trends</span>
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">
                                    Temporal institutional recognition flow
                                </p>
                            </div>
                            <Activity className="h-6 w-6 text-emerald-500 opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={issuanceTrends}>
                                    <defs>
                                        <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "#88888870", fontSize: 10, fontWeight: "bold" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888850", fontSize: 10 }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                    />
                                    <Area type="monotone" dataKey="Issued" stroke="#10b981" fillOpacity={1} fill="url(#colorIssued)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="Revoked" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">
                            Credential <span className="text-emerald-600 px-1">/</span> Distribution
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3 text-center">
                            Recognition spectrum profiling
                        </p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={certTypes}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {certTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-x-3">
                            <Shield className="h-4 w-4" />
                            Issued Certificates
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search reference or name..."
                                className="pl-9 rounded-xl border border-slate-200 bg-white h-10 text-xs font-bold text-slate-700 placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Reference Number</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Student</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="text-right py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCertificates.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 transition-all group-hover:scale-110">
                                                        <Award className="h-6 w-6 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight text-sm">
                                                            {cert.reference_number || "PENDING"}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            TYPE: {cert.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                                                    {cert.student?.profile?.first_name} {cert.student?.profile?.last_name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                    ID: {cert.student?.admission_number} &bull; {cert.issued_date}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    "inline-block text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                                                    cert.status === "issued" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                )}>
                                                    {cert.status?.toUpperCase() || "ISSUED"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex justify-end gap-x-2">
                                                    <PDFDownloadButton
                                                        certificate={cert}
                                                        fileName={`${cert.reference_number || 'cert'}.pdf`}
                                                    />
                                                    {isAdminOrTeacher && (
                                                        <button
                                                            onClick={() => handleRevoke(cert.id)}
                                                            className="h-9 w-9 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCertificates.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-12 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                                No institutional records detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="border-b border-slate-100 p-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-x-3">
                                <Star className="h-4 w-4" />
                                Certificate Preview
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="aspect-[1.414/1] w-full bg-slate-50 shadow-2xl border-[12px] border-emerald-100 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center group transition-all hover:border-emerald-200">
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <GraduationCap className="h-32 w-32 text-slate-800" />
                                </div>
                                <Award className="h-8 w-8 text-slate-800 mb-2" />
                                <h2 className="text-lg font-serif text-slate-900 leading-tight">Certificate of Achievement</h2>
                                <p className="text-[6px] tracking-widest text-slate-500 uppercase mt-2 mb-4">Awarded To</p>
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase">STUDENT NAME</h3>
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-slate-200 pt-2">
                                    <div className="text-left w-1/3">
                                        <p className="text-[4px] font-black uppercase text-slate-400">Date Issued</p>
                                        <div className="h-px bg-slate-200 w-full mt-1"></div>
                                    </div>
                                    <div className="h-6 w-6 rounded-sm border border-slate-900 flex items-center justify-center -mt-2 bg-white relative z-10 shadow-lg">
                                        <ShieldCheck className="h-3 w-3 text-slate-900" />
                                    </div>
                                    <div className="text-right w-1/3">
                                        <p className="text-[4px] font-black uppercase text-slate-400">Registrar</p>
                                        <div className="h-px bg-slate-200 w-full mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 text-slate-900 p-6 relative overflow-hidden group rounded-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-16 w-16 text-emerald-600" />
                        </div>
                        <h4 className="text-sm font-black tracking-tight mb-2 uppercase text-emerald-700">
                            Secure Records
                        </h4>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase tracking-tighter">
                            All certificates are securely stored and verified in our database.
                        </p>
                        <button className="mt-6 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all">
                            VIEW SECURITY LOGS
                        </button>
                    </div>
                </div>
            </div>

            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-slate-900">Issue Certificate</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Formal recognition of academic or athletic achievement</p>
                            </div>
                            <button onClick={() => setShowIssueModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        <form onSubmit={handleIssue} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student</label>
                                <select name="student_id" required className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select Student...</option>
                                    {students.map((s) => (<option key={s.id} value={s.id}>[{s.admission_number}] {s.profile?.first_name} {s.profile?.last_name}</option>))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Certificate Type</label>
                                <select name="type" required className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select Type...</option>
                                    <option value="Academic Excellence">Academic Excellence</option>
                                    <option value="Athletic Achievement">Athletic Achievement</option>
                                    <option value="Conduct & Leadership">Conduct & Leadership</option>
                                    <option value="Special Commendation">Special Commendation</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notes</label>
                                <input name="notes" placeholder="Reason for issuing..." className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" />
                            </div>
                            <button type="submit" disabled={isIssuing} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {isIssuing ? "Issuing..." : "Issue Certificate"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
