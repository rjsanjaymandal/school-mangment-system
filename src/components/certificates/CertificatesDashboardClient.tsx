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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        Transcript Engine
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Institutional Credentials and Verification Services
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Verify Portal
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue min-w-[160px]"
                    >
                        {isGenerating ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                            Issuance Ledger
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search reference or name..."
                                className="pl-9 rounded-xl border-slate-100 h-10 text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/50">
                                    <tr className="border-b">
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                            Reference & Type
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                            Recipient
                                        </th>
                                        <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                            Status
                                        </th>
                                        <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {certificates.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className="hover:bg-white/60 transition-colors"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-x-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                        <Award className="h-5 w-5 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900">
                                                            {cert.reference_number}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {cert.type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-slate-900">
                                                    {cert.student?.profile?.first_name} {cert.student?.profile?.last_name}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    ID: {cert.student?.admission_number}
                                                </p>
                                            </td>
                                            <td className="p-5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] font-black px-3 py-1 rounded-xl",
                                                        cert.status === "issued"
                                                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                            : "bg-red-500/10 text-red-600 border-red-500/20"
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
                                                        className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {certificates.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center p-8 text-slate-500 text-sm">
                                                No certificates found.
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
                    <Card className="border-none glass futuristic-card overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                                <Star className="h-4 w-4 text-blue-400" />
                                Live Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 bg-slate-100/50">
                            {/* Simplified Mini-Preview for visual feedback */}
                            <div
                                className="aspect-[1.414/1] w-full bg-white shadow-md border-4 border-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group"
                            >
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <GraduationCap className="h-32 w-32" />
                                </div>

                                <Award className="h-8 w-8 text-slate-900 mb-2" />
                                <h2 className="text-lg font-serif italic text-slate-900 leading-tight">Certificate of Achievement</h2>
                                <p className="text-[6px] tracking-widest text-slate-400 uppercase mt-2 mb-4">Awarded To</p>
                                <h3 className="text-xl font-black text-slate-900 mb-4 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Alexander Pierce</h3>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-slate-200 pt-2">
                                    <div className="text-left w-1/3">
                                        <p className="text-[4px] font-black uppercase text-slate-400">Date</p>
                                        <div className="h-px bg-slate-900 w-full mt-1"></div>
                                    </div>
                                    <div className="h-6 w-6 rounded-full border border-slate-900 flex items-center justify-center -mt-2 bg-white relative z-10">
                                        <ShieldCheck className="h-3 w-3 text-slate-900" />
                                    </div>
                                    <div className="text-right w-1/3">
                                        <p className="text-[4px] font-black uppercase text-slate-400">Head</p>
                                        <div className="h-px bg-slate-900 w-full mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none glass futuristic-card bg-blue-500 text-white p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-16 w-16" />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2">
                            Academic Shield
                        </h4>
                        <p className="text-xs opacity-80 font-medium leading-relaxed">
                            All transcripts are cryptographically signed and stored in the
                            institutional distributed ledger for tamper-proof verification.
                        </p>
                        <Button className="mt-6 w-full bg-white text-blue-600 font-black rounded-xl hover:bg-white/90">
                            VIEW SECURITY LOGS
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
