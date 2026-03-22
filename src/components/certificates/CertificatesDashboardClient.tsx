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
    Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { CertificatePDF } from "./CertificatePDF";

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false, loading: () => <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-slate-300"><Download className="h-4 w-4" /></Button> }
);

export default function CertificatesDashboardClient({ initialCertificates }: { initialCertificates: any[] }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const certRef = useRef<HTMLDivElement>(null);

    const certificates = initialCertificates.filter((cert) =>
        cert.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.student?.profile?.first_name && cert.student.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cert.student?.profile?.last_name && cert.student.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleGenerate = () => {
        setIsGenerating(true);
        // Real generation logic would call the server action `generateCertificate`
        // followed by creating/downloading a PDF blob from the `certRef` content.
        setTimeout(() => setIsGenerating(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                        Transcript Engine
                    </h2>
                    <p className="text-foreground/70 font-bold tracking-tight">
                        Institutional Credentials and Verification Services
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        variant="ghost"
                        className="rounded-sm border border-border bg-card/40 backdrop-blur-md font-bold gap-x-2 text-foreground/80 hover:text-primary transition-all shadow-xl"
                    >
                        <Share2 className="h-4 w-4" />
                        Verify Portal
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[160px] uppercase tracking-widest text-[10px]"
                    >
                        {isGenerating ? (
                            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {isGenerating ? "Engraving..." : "Issue Certificate"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Side: Ledger and Analytics */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                            Issuance Ledger
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
                            <Input
                                placeholder="Search reference or name..."
                                className="pl-9 rounded-xs border-border bg-card/30 backdrop-blur-sm h-10 text-xs text-foreground placeholder:text-foreground/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-accent/40">
                                    <tr className="border-b border-border">
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                            Reference & Type
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                            Recipient
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                            Status
                                        </th>
                                        <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {certificates.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className="hover:bg-accent/20 border-b border-border transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-10 w-10 rounded-xs bg-primary/10 flex items-center justify-center border border-primary/20">
                                                        <Award className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground group-hover:text-primary transition-colors">
                                                            {cert.reference_number}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-tighter">
                                                            {cert.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-foreground">
                                                    {cert.student?.profile?.first_name} {cert.student?.profile?.last_name}
                                                </p>
                                                <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">
                                                    ID: {cert.student?.admission_number}
                                                </p>
                                            </td>
                                            <td className="p-5">
                                                <Badge
                                                    className={cn(
                                                        "text-[10px] font-black px-3 py-1 rounded-xs uppercase tracking-[0.2em] shadow-lg",
                                                        cert.status === "issued"
                                                            ? "bg-primary text-primary-foreground emerald-glow"
                                                            : "bg-destructive text-destructive-foreground"
                                                    )}
                                                >
                                                    {cert.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xs"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <PDFDownloadLink
                                                        document={<CertificatePDF certificate={cert} />}
                                                        fileName={`${cert.reference_number}.pdf`}
                                                    >
                                                        {({ loading }) => (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={loading}
                                                                className={cn(
                                                                    "h-8 w-8 rounded-xs transition-colors",
                                                                    loading
                                                                        ? "text-foreground/20 pointer-events-none"
                                                                        : "text-foreground/40 hover:text-foreground hover:bg-accent"
                                                                )}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </PDFDownloadLink>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {certificates.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-foreground/50 text-xs font-bold uppercase tracking-widest">
                                                No institutional records detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Controls & Preview */}
                <div className="space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                        <CardHeader className="bg-primary text-primary-foreground p-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-x-2">
                                <Star className="h-4 w-4" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 bg-background/20 backdrop-blur-md">
                            {/* Simplified Mini-Preview for visual feedback */}
                            <div
                                className="aspect-[1.414/1] w-full bg-white shadow-2xl border-4 border-foreground relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group"
                            >
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <GraduationCap className="h-32 w-32" />
                                </div>

                                <Award className="h-8 w-8 text-foreground mb-2" />
                                <h2 className="text-lg font-serif italic text-foreground leading-tight">Certificate of Achievement</h2>
                                <p className="text-[6px] tracking-widest text-muted-foreground uppercase mt-2 mb-4">Awarded To</p>
                                <h3 className="text-xl font-black text-foreground mb-4 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Alexander Pierce</h3>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-border pt-2">
                                    <div className="text-left w-1/3">
                                        <p className="text-[4px] font-black uppercase text-muted-foreground">Date</p>
                                        <div className="h-px bg-card w-full mt-1"></div>
                                    </div>
                                    <div className="h-6 w-6 rounded-full border border-slate-900 flex items-center justify-center -mt-2 bg-white relative z-10">
                                        <ShieldCheck className="h-3 w-3 text-foreground" />
                                    </div>
                                    <div className="text-right w-1/3">
                                        <p className="text-[4px] font-black uppercase text-muted-foreground">Head</p>
                                        <div className="h-px bg-card w-full mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-primary/10 text-foreground p-6 relative overflow-hidden group shadow-2xl rounded-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-16 w-16 text-primary" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2 uppercase text-primary">
                            Academic Shield
                        </h4>
                        <p className="text-xs text-foreground/70 font-bold leading-relaxed">
                            All transcripts are cryptographically signed and stored in the
                            institutional distributed ledger for tamper-proof verification.
                        </p>
                        <Button className="mt-6 w-full bg-primary text-primary-foreground font-black rounded-xs hover:bg-primary/90 emerald-glow uppercase tracking-widest text-[10px]">
                            VIEW SECURITY LOGS
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

