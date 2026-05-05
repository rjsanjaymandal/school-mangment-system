"use client";

import { useState, useEffect } from "react";
import { 
    Printer, 
    ArrowLeft, 
    Search, 
    FileText, 
    Loader2,
    Calendar,
    MapPin,
    Clock,
    UserCheck,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getAdmitCardData } from "@/app/actions/hr";
import { toast } from "sonner";

export default function AdmitCardGeneratorPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedExam, setSelectedExam] = useState("");
    const [loading, setLoading] = useState(false);
    const [admitCards, setAdmitCards] = useState<any>(null);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        const fetchMeta = async () => {
            const supabase = createClient();
            const { data: cls } = await supabase.from("classes").select("id, name").order("name");
            const { data: exm } = await supabase.from("exams").select("id, name, date").order("date", { ascending: false });
            setClasses(cls || []);
            setExams(exm || []);
        };
        fetchMeta();
    }, []);

    const handleGenerate = async () => {
        if (!selectedClass || !selectedExam) {
            toast.error("Please select both Class and Exam");
            return;
        }

        setLoading(true);
        const result = await getAdmitCardData(selectedClass, selectedExam);
        setLoading(false);

        if (result.error || !result.data) {
            toast.error(result.error || "Failed to generate admit cards");
        } else {
            setAdmitCards(result.data);
            setPreviewMode(true);
            toast.success("Admit Cards generated for " + result.data.students.length + " students");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (previewMode && admitCards) {
        return (
            <div className="space-y-8">
                {/* Preview Header - Hidden on Print */}
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setPreviewMode(false)} className="rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Print Preview</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{admitCards.students.length} Cards Generated</p>
                        </div>
                    </div>
                    <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8">
                        <Printer className="h-4 w-4" /> Print All Cards
                    </Button>
                </div>

                {/* Admit Card Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:gap-0">
                    {admitCards.students.map((student: any, idx: number) => (
                        <AdmitCardTemplate 
                            key={student.id} 
                            student={student} 
                            exam={admitCards.exam} 
                            settings={admitCards.schoolSettings}
                        />
                    ))}
                </div>

                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .print-card {
                            page-break-inside: avoid;
                            margin-bottom: 20px;
                            border: 1px solid #000 !important;
                            visibility: visible !important;
                        }
                        /* Hide Sidebar/Nav */
                        header, aside, .print-hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 pb-20">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Admit Card Generator</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Bulk Exam Hall Ticket Production</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="blue" className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Class</Label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-200">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Exam Session</Label>
                        <Select onValueChange={setSelectedExam} value={selectedExam}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-200">
                                <SelectValue placeholder="Select Exam" />
                            </SelectTrigger>
                            <SelectContent>
                                {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({new Date(e.date).toLocaleDateString()})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-12 h-14 font-black italic tracking-tight gap-3 shadow-xl shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                        Generate Hall Tickets
                    </Button>
                </div>
            </ERPCard>

            {/* Help / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: FileText, title: "A4 Layout", desc: "Cards are optimized to fit 2 per A4 sheet." },
                    { icon: CheckCircle2, title: "Verified Data", desc: "Pulls from latest subject & enrollment data." },
                    { icon: Printer, title: "Direct Print", desc: "No download needed. Print directly to thermal or laser." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                        <item.icon className="h-6 w-6 text-slate-400 mb-3" />
                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{item.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdmitCardTemplate({ student, exam, settings }: { student: any, exam: any, settings: any }) {
    return (
        <div className="bg-white border-2 border-slate-900 rounded-lg p-6 flex flex-col gap-4 print-card print-area max-w-md mx-auto h-[480px] relative overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
                <div className="h-12 w-12 bg-slate-900 rounded flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-lg italic">EM</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic leading-none">{settings?.school_name || "Edu Maysan Academy"}</h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Official Examination Hall Ticket • {(Array.isArray(exam.academic_year) ? exam.academic_year[0] : exam.academic_year)?.name || '2026-27'}</p>
                </div>
            </div>

            {/* Admit Card Title */}
            <div className="bg-slate-900 text-white py-1 px-4 self-center rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">
                {exam.name} Admit Card
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-1 gap-3 mt-2">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Student Name</span>
                    <span className="text-xs font-bold uppercase">{student.full_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Roll / Admission No.</span>
                    <span className="text-xs font-mono font-bold tracking-tighter">{student.admission_number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Class & Section</span>
                    <span className="text-xs font-bold">{(Array.isArray(student.class) ? student.class[0] : student.class)?.name}</span>
                </div>
            </div>

            {/* Exam Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Details</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-[10px] font-bold">Date: {new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        <span className="text-[10px] font-bold">Time: {exam.start_time} - {exam.end_time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-3 w-3 text-amber-600" />
                        <span className="text-[10px] font-bold">Venue: Examination Hall A</span>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-auto pt-6 flex justify-between items-end">
                <div className="text-center">
                    <div className="w-24 h-px bg-slate-400 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Class Teacher</span>
                </div>
                <div className="text-center relative">
                    {/* Placeholder for stamp */}
                    <div className="absolute -top-10 -right-2 h-16 w-16 border-2 border-emerald-600/30 rounded-full flex items-center justify-center rotate-12">
                        <span className="text-[6px] text-emerald-600/50 font-black uppercase text-center leading-none">Edu Maysan<br/>Verified</span>
                    </div>
                    <div className="w-24 h-px bg-slate-900 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Principal</span>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-slate-900/5 rotate-45" />
        </div>
    );
}
