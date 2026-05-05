"use client";

import { useState, useEffect } from "react";
import { 
    Printer, 
    ArrowLeft, 
    FileText, 
    Loader2,
    Users,
    Search,
    Award,
    CheckCircle2,
    ScrollText,
    Signature
} from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CertificateCreatorPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [certificateType, setCertificateType] = useState('transfer');
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("school_settings").select("key, value");
            const s = data?.reduce((acc: any, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            setSettings(s || {});
        };
        fetchSettings();
    }, []);

    const searchStudents = async () => {
        if (!searchQuery) return;
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from("students")
            .select(`
                id, admission_number, full_name, 
                class:classes(name),
                "father's_name", mother_name,
                date_of_birth, admission_date
            `)
            .or(`full_name.ilike.%${searchQuery}%,admission_number.ilike.%${searchQuery}%`)
            .limit(5);
        
        setStudents(data || []);
        setLoading(false);
    };

    const handleGenerate = () => {
        if (!selectedStudent) {
            toast.error("Please select a student first");
            return;
        }
        setPreviewMode(true);
    };

    if (previewMode && selectedStudent) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setPreviewMode(false)} className="rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Certificate Preview</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{certificateType.toUpperCase()} Certificate</p>
                        </div>
                    </div>
                    <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8">
                        <Printer className="h-4 w-4" /> Print Certificate
                    </Button>
                </div>

                <div className="bg-white p-12 min-h-[11in] max-w-[8.5in] mx-auto border-2 border-slate-900 rounded shadow-2xl relative print:border-none print:shadow-none print-area">
                    <CertificateTemplate 
                        student={selectedStudent} 
                        type={certificateType} 
                        settings={settings}
                    />
                </div>

                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        header, aside, .print-hidden { display: none !important; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Certificate Creator</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Institutional Credential Generation</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="amber" className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-600">Search Student</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Name or Admission No." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                                className="pl-10 rounded-xl h-12 border-slate-200"
                            />
                        </div>
                        {students.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-xl mt-2 overflow-hidden shadow-lg animate-in slide-in-from-top-2 duration-300">
                                {students.map((s) => (
                                    <div 
                                        key={s.id} 
                                        onClick={() => setSelectedStudent(s)}
                                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-slate-50 flex justify-between items-center transition-colors ${selectedStudent?.id === s.id ? 'bg-amber-50 border-amber-200' : ''}`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{s.full_name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.admission_number} • {s.class?.name}</p>
                                        </div>
                                        {selectedStudent?.id === s.id && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-600">Certificate Type</Label>
                        <Select onValueChange={setCertificateType} value={certificateType}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-200">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transfer">Transfer Certificate (TC)</SelectItem>
                                <SelectItem value="character">Character Certificate</SelectItem>
                                <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Button 
                        onClick={handleGenerate} 
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-12 h-14 font-black italic tracking-tight gap-3 shadow-xl shadow-amber-600/20"
                    >
                        <ScrollText className="h-5 w-5" />
                        Generate Certificate
                    </Button>
                </div>
            </ERPCard>
        </div>
    );
}

function CertificateTemplate({ student, type, settings }: { student: any, type: string, settings: any }) {
    const title = type === 'transfer' ? 'Transfer Certificate' : type === 'character' ? 'Character Certificate' : 'Bonafide Certificate';
    
    return (
        <div className="flex flex-col h-full items-center p-8 border-8 border-double border-slate-200 relative overflow-hidden">
            {/* Corner Borders */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-amber-600/20" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-amber-600/20" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-amber-600/20" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-amber-600/20" />

            {/* Header */}
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase">{settings?.school_name || "Edu Maysan Academy"}</h1>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Institutional Excellence & Character</p>
                <div className="w-48 h-1 bg-amber-600 mx-auto mt-4" />
            </div>

            <div className="mt-8 mb-16 text-center">
                <h2 className="text-5xl font-black italic text-slate-900 tracking-tight border-b-4 border-slate-900 pb-2 mb-2">{title}</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Academic Session 2026-27</p>
            </div>

            {/* Body */}
            <div className="flex-1 w-full space-y-10 px-8 text-lg leading-relaxed text-slate-800 text-justify font-serif">
                <p>
                    This is to certify that <strong>{student.full_name}</strong>, 
                    son/daughter of <strong>{student["father's_name"] || 'Not Specified'}</strong> and 
                    <strong> {student.mother_name || 'Not Specified'}</strong>, 
                    bearing Admission Number <strong>{student.admission_number}</strong>, 
                    was a student of <strong>Class {student.class?.name}</strong> at 
                    {settings?.school_name || "Edu Maysan Academy"}.
                </p>

                {type === 'transfer' && (
                    <p>
                        He/She was admitted to this institution on <strong>{new Date(student.admission_date).toLocaleDateString()}</strong>. 
                        His/Her conduct during his/her stay in this institution has been found to be 
                        satisfactory. All school dues have been cleared. We wish him/her every success 
                        in his/her future academic pursuits.
                    </p>
                )}

                {type === 'character' && (
                    <p>
                        He/She is known to the undersigned for the past three years. To the best of 
                        my knowledge and belief, he/she bears a good moral character and possesses 
                        excellent leadership qualities. He/She has been active in co-curricular activities 
                        and sports.
                    </p>
                )}

                <div className="grid grid-cols-1 gap-6 pt-12">
                    <div className="flex justify-between border-b-2 border-dotted border-slate-200 pb-2">
                        <span className="text-xs font-black uppercase text-slate-400 italic">Date of Issue</span>
                        <span className="font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dotted border-slate-200 pb-2">
                        <span className="text-xs font-black uppercase text-slate-400 italic">Place</span>
                        <span className="font-bold">Maysan Valley</span>
                    </div>
                </div>
            </div>

            {/* Footer Signatures */}
            <div className="w-full mt-20 flex justify-between items-end px-8">
                <div className="text-center space-y-2">
                    <div className="w-32 h-px bg-slate-400" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Prepared By</p>
                </div>
                <div className="text-center space-y-2 relative">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-20">
                        <Award className="h-24 w-24 text-amber-600" />
                    </div>
                    <div className="w-48 h-px bg-slate-900" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
}
