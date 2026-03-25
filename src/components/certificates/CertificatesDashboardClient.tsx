"use client";

import { useState, useRef } from "react";
import {
    Award,
    Download,
    Share2,
    Printer,
    ShieldCheck,
    GraduationCap,
    Star,
    BookOpen,
    Search,
    Plus,
    Trash2,
    Eye,
    Shield,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { CertificatePDF } from "./CertificatePDF";
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

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false, loading: () => <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-slate-300"><Download className="h-4 w-4" /></Button> }
);

export default function CertificatesDashboardClient({ 
    initialCertificates,
    students,
    currentUserId,
    userRole
}: { 
    initialCertificates: any[],
    students: Student[],
    currentUserId?: string,
    userRole?: string | null
}) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    const [certificates, setCertificates] = useState(initialCertificates);

    const filteredCertificates = certificates.filter((cert) =>
        cert.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificate_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.student?.profile?.first_name && cert.student.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cert.student?.profile?.last_name && cert.student.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                window.location.reload();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to execute issuance protocol");
        } finally {
            setIsIssuing(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Confirm revocation of this institutional asset?")) return;
        
        try {
            const result = await revokeCertificate(id);
            if (result.success) {
                toast.success(result.message);
                setCertificates(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Revocation failure");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Transcript Registry
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Institutional Credentials & Cryptographic Verification
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
                                        <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-primary">Issuance Protocol</DialogTitle>
                                        <DialogDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                                            Formal institutional recognition of academic or athletic achievement.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Target Individual (Student)</p>
                                            <Select name="student_id" required>
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Authenticate Candidate..." />
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
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Credential Type</p>
                                            <span className="sr-only">Credential Type</span>
                                            <Select name="type" required>
                                                <SelectTrigger className="rounded-sm border-border bg-background h-12 text-xs font-bold uppercase tracking-tight">
                                                    <SelectValue placeholder="Classification..." />
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
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Authorization Notes</p>
                                            <Input name="notes" placeholder="Contextual data for audit trail..." className="rounded-sm border-border bg-background h-12 text-xs font-bold" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            type="submit" 
                                            disabled={isIssuing}
                                            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] h-14 rounded-sm emerald-glow"
                                        >
                                            {isIssuing ? "PROVISIONING..." : "CONFIRM ISSUANCE"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary italic flex items-center gap-x-3">
                            <Shield className="h-4 w-4" />
                            Issuance Ledger
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
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Reference & Schematic</th>
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Recipient Node</th>
                                        <th className="text-left p-6 font-black uppercase tracking-[0.2em] text-[10px] text-primary italic">Registry Status</th>
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
                                                            {cert.reference_number || "PENDING_ID"}
                                                        </p>
                                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-0.5">
                                                            PROTOCOL: {cert.certificate_type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-black text-foreground uppercase tracking-tight italic text-[11px]">
                                                    {cert.student?.profile?.first_name} {cert.student?.profile?.last_name}
                                                </p>
                                                <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">
                                                    ID: {cert.student?.admission_number}
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
                                                    <PDFDownloadLink
                                                        document={<CertificatePDF certificate={cert} />}
                                                        fileName={`${cert.reference_number || 'cert'}.pdf`}
                                                    >
                                                        {({ loading }) => (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={loading}
                                                                className="h-9 w-9 border border-border rounded-sm text-foreground/40 hover:text-primary hover:border-primary transition-all"
                                                            >
                                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                            </Button>
                                                        )}
                                                    </PDFDownloadLink>
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
                                Live Registry Preview
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
                                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase italic">PROTOCOL_CANDIDATE</h3>
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
                            Academic Shield
                        </h4>
                        <p className="text-xs text-foreground/70 font-bold leading-relaxed uppercase tracking-tighter">
                            All transcripts are cryptographically signed and stored in the
                            institutional distributed ledger for tamper-proof verification.
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
