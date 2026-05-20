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
    Activity, Zap
} from "lucide-react";
import { 
    AreaChart, Area, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    const [open, setOpen] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const [certificates, setCertificates] = useState(initialCertificates);

    const filteredCertificates = certificates.filter((cert) =>
        cert.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.student?.profile?.first_name && cert.student.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cert.student?.profile?.last_name && cert.student.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- Credential Intelligence Layer ---
    const issuanceTrends = useMemo(() => {
        const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
        const monthBuckets = new Map<string, { name: string; Issued: number; Revoked: number }>();

        certificates.forEach((certificate) => {
            const month = formatter.format(new Date(certificate.issued_date || certificate.created_at || Date.now()));
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
                setOpen(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Certificates
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Student certificates and recognition
                    </p>
                </div>
                {isAdminOrTeacher && (
                    <div className="flex gap-x-3">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] px-8 py-6 h-auto emerald-glow shadow-2xl hover:scale-105 transition-all">
                                    {isAdminOrTeacher ? (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Issue Certificate
                                        </>
                                    ) : (
                                        <>
                                            <Award className="h-4 w-4 mr-2" />
                                            Request Certificate
                                        </>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-card border-primary/20 rounded-sm">
                                <form onSubmit={handleIssue}>
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-primary">Issue Certificate</DialogTitle>
                                        <DialogDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                                            Formal recognition of academic or athletic achievement.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Select Student</p>
                                            <Select name="student_id" required>
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Search student..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    {students.map((s) => (
                                                        <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase tracking-tight">
                                                            [{s.admission_number}] {s.profile?.first_name} {s.profile?.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Certificate Type</p>
                                            <span className="sr-only">Credential Type</span>
                                            <Select name="type" required>
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Select type..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="Academic Excellence" className="text-xs font-bold uppercase tracking-tight">Academic Excellence</SelectItem>
                                                    <SelectItem value="Athletic Achievement" className="text-xs font-bold uppercase tracking-tight">Athletic Achievement</SelectItem>
                                                    <SelectItem value="Conduct & Leadership" className="text-xs font-bold uppercase tracking-tight">Conduct & Leadership</SelectItem>
                                                    <SelectItem value="Special Commendation" className="text-xs font-bold uppercase tracking-tight">Special Commendation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Notes</p>
                                            <Input name="notes" placeholder="Reason for issuing certificate..." className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isIssuing}
                                            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] h-14 rounded-sm emerald-glow"
                                        >
                                            {isIssuing ? "ISSUING..." : "CONFIRM ISSUANCE"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* --- Analytics Layer: Institutional Recognition Intelligence --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-1 w-full relative z-10 mt-10">
                <div className="md:col-span-8 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    Issuance <span className="text-primary italic">Trends</span>
                                </h3>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic flex items-center gap-2">
                                    Temporal Institutional recognition flow
                                </p>
                            </div>
                            <Activity className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-all" />
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

                <div className="md:col-span-4 bg-card border border-border p-10 rounded-xl relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            Credential <span className="text-primary tracking-normal not-italic px-1">/</span> Distribution
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/30 mt-3 italic text-center">Recognition Spectrum Profiling</p>
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
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary italic flex items-center gap-x-3">
                            <Shield className="h-4 w-4" />
                            Issued Certificates
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                            <Input
                                placeholder="Search reference or name..."
                                className="pl-9 rounded-sm border-border bg-card/30 backdrop-blur-sm h-10 text-xs text-foreground placeholder:text-foreground/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-primary/10">
                                    <tr className="border-b border-primary/20">
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Reference Number</th>
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Student</th>
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Status</th>
                                        <th className="text-right p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredCertificates.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-primary/5 border-b border-border transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 transition-all group-hover:scale-110 emerald-glow">
                                                        <Award className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-tight italic">
                                                            {cert.reference_number || "PENDING"}
                                                        </p>
                                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-0.5">
                                                            TYPE: {cert.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-black text-foreground uppercase tracking-tight italic text-[11px]">
                                                    {cert.student?.profile?.first_name} {cert.student?.profile?.last_name}
                                                </p>
                                                <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">
                                                    ID: {cert.student?.admission_number} • {cert.issued_date}
                                                </p>
                                            </td>
                                            <td className="p-5">
                                                <Badge className={cn(
                                                    "text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg",
                                                    cert.status === "issued" ? "bg-primary text-primary-foreground emerald-glow" : "bg-destructive text-destructive-foreground"
                                                )}>
                                                    {cert.status?.toUpperCase() || "ISSUED"}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-x-2">
                                                    <PDFDownloadButton
                                                        certificate={cert}
                                                        fileName={`${cert.reference_number || 'cert'}.pdf`}
                                                    />
                                                    {isAdminOrTeacher && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRevoke(cert.id)}
                                                            className="h-9 w-9 border border-border rounded-sm text-foreground/40 hover:text-destructive hover:border-destructive transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCertificates.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-12 text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                                                No institutional records detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <CardHeader className="bg-primary/10 border-b border-primary/20 p-6">
                            <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-x-3 italic">
                                <Star className="h-4 w-4" />
                                Certificate Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 bg-background/50">
                            <div className="aspect-[1.414/1] w-full bg-slate-50 shadow-2xl border-[12px] border-primary/10 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center group transition-all hover:border-primary/20">
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <GraduationCap className="h-32 w-32" />
                                </div>
                                <Award className="h-8 w-8 text-slate-800 mb-2" />
                                <h2 className="text-lg font-serif italic text-slate-900 leading-tight">Certificate of Achievement</h2>
                                <p className="text-[6px] tracking-widest text-slate-500 uppercase mt-2 mb-4">Awarded To</p>
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic">STUDENT NAME</h3>
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
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-primary/10 text-foreground p-8 relative overflow-hidden group shadow-2xl rounded-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-16 w-16 text-primary" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2 uppercase text-primary italic">
                            Secure Records
                        </h4>
                        <p className="text-xs text-foreground/70 font-bold leading-relaxed uppercase tracking-tighter">
                            All certificates are securely stored and verified in our database.
                        </p>
                        <Button className="mt-8 w-full bg-primary text-primary-foreground font-black rounded-sm h-12 hover:scale-[1.02] transition-all emerald-glow uppercase tracking-[0.2em] text-[9px]">
                            VIEW SECURITY LOGS
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
