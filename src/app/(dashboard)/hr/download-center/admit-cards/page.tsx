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
import { createClient } from "@/lib/supabase/client";
import { getAdmitCardData } from "@/app/actions/hr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPreviewMode(false)} className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Print Preview</h2>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{admitCards.students.length} Cards Generated</p>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
                        <Printer className="h-4 w-4" /> Print All Cards
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block print:gap-0">
                    {admitCards.students.map((student: any, idx: number) => (
                        <AdmitCardTemplate 
                            key={student.id} 
                            student={student} 
                            exam={admitCards.exam} 
                            settings={admitCards.schoolSettings}
                        />
                    ))}
                </div>

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
                        header, aside, .print-hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 pb-20 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <button className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Admit Card Generator</h1>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Generate exam hall tickets</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="blue" className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Target Class</label>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Exam Session</label>
                        <select 
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                        >
                            <option value="">Select Exam</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({new Date(e.date).toLocaleDateString()})</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-10 shadow-lg transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                        Generate Hall Tickets
                    </button>
                </div>
            </ERPCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: FileText, title: "A4 Layout", desc: "Cards are optimized to fit 2 per A4 sheet." },
                    { icon: CheckCircle2, title: "Verified Data", desc: "Pulls from latest subject & enrollment data." },
                    { icon: Printer, title: "Direct Print", desc: "No download needed. Print directly to thermal or laser." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center text-center">
                        <item.icon className="h-6 w-6 text-slate-400 mb-3" />
                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdmitCardTemplate({ student, exam, settings }: { student: any, exam: any, settings: any }) {
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl p-6 flex flex-col gap-4 print-card print-area max-w-md mx-auto h-[480px] relative overflow-hidden">
            <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
                <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-lg">EM</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black uppercase tracking-tighter leading-none">{settings?.school_name || "Edu Maysan Academy"}</h3>
                    <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Official Examination Hall Ticket • {(Array.isArray(exam.academic_year) ? exam.academic_year[0] : exam.academic_year)?.name || '2026-27'}</p>
                </div>
            </div>

            <div className="bg-slate-900 text-white py-1 px-4 self-center rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {exam.name} Admit Card
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Student Name</span>
                    <span className="text-xs font-bold uppercase">{student.full_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Roll / Admission No.</span>
                    <span className="text-xs font-mono font-bold tracking-tighter">{student.admission_number}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Class & Section</span>
                    <span className="text-xs font-bold">{(Array.isArray(student.class) ? student.class[0] : student.class)?.name}</span>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-2">
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

            <div className="mt-auto pt-6 flex justify-between items-end">
                <div className="text-center">
                    <div className="w-24 h-px bg-slate-400 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Class Teacher</span>
                </div>
                <div className="text-center relative">
                    <div className="absolute -top-10 -right-2 h-16 w-16 border-2 border-emerald-600/30 rounded-full flex items-center justify-center rotate-12">
                        <span className="text-[6px] text-emerald-600/50 font-black uppercase text-center leading-none">Edu Maysan<br/>Verified</span>
                    </div>
                    <div className="w-24 h-px bg-slate-900 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Principal</span>
                </div>
            </div>

            <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-slate-900/5 rotate-45" />
        </div>
    );
}
