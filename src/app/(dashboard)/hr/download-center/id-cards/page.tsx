"use client";

import { useState, useEffect } from "react";
import { 
    Printer, 
    ArrowLeft, 
    CreditCard, 
    Loader2,
    Users,
    ShieldCheck,
    Briefcase,
    Phone,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { ERPCard } from "@/components/ui/erp-card";
import { createClient } from "@/lib/supabase/client";
import { getIDCardData } from "@/app/actions/hr";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function IDCardGeneratorPage() {
    const [targetType, setTargetType] = useState<'student' | 'staff'>('student');
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("all");
    const [loading, setLoading] = useState(false);
    const [idCards, setIdCards] = useState<any>(null);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        const fetchMeta = async () => {
            const supabase = createClient();
            const { data: cls } = await supabase.from("classes").select("id, name").order("name");
            setClasses(cls || []);
        };
        fetchMeta();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        const result = await getIDCardData(targetType, selectedClass);
        setLoading(false);

        if (result.error || !result.data) {
            toast.error(result.error || "Failed to generate ID cards");
        } else {
            setIdCards(result.data);
            setPreviewMode(true);
            const count = result.data.members?.length ?? 0;
            toast.success("ID Cards generated for " + count + " members");
        }
    };

    if (previewMode && idCards) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPreviewMode(false)} className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">ID Card Preview</h2>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{idCards.members.length} Cards Generated</p>
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
                        <Printer className="h-4 w-4" /> Print ID Cards
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:block print:columns-2">
                    {idCards.members.map((member: any) => (
                        <div key={member.id} className="print:break-inside-avoid print:mb-8">
                            <IDCardTemplate 
                                member={member} 
                                type={targetType}
                                settings={idCards.schoolSettings}
                            />
                        </div>
                    ))}
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
        <div className="space-y-8 max-w-4xl mx-auto p-6 pb-20 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <button className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Identity Card Generator</h1>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Generate CR80 sized ID cards</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="emerald" className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Card Type</label>
                        <select 
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value as 'student' | 'staff')}
                            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                        >
                            <option value="student">Student Identity Card</option>
                            <option value="staff">Staff Identity Card</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Filter / Group</label>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                        >
                            <option value="all">All Active {targetType === 'student' ? 'Students' : 'Staff'}</option>
                            {targetType === 'student' && classes.map(c => (
                                <option key={c.id} value={c.id}>Class: {c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-10 shadow-lg transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                        Generate ID Cards
                    </button>
                </div>
            </ERPCard>
        </div>
    );
}

function IDCardTemplate({ member, type, settings }: { member: any, type: string, settings: any }) {
    const isStudent = type === 'student';
    const name = isStudent ? member.full_name : `${member.first_name} ${member.last_name}`;
    const subId = isStudent ? member.admission_number : member.staff_id;
    const deptData = isStudent ? member.class : member.department;
    const designationData = isStudent ? null : member.designation;
    
    const dept = (Array.isArray(deptData) ? deptData[0] : deptData)?.name;
    const role = isStudent ? "Student" : (Array.isArray(designationData) ? designationData[0] : designationData)?.name;

    return (
        <div className="w-[240px] aspect-[1/1.58] bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden flex flex-col print-area mx-auto bg-gradient-to-b from-white to-slate-50">
            <div className="bg-slate-900 h-2" />
            
            <div className="p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="h-5 w-5 bg-slate-900 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">Edu Maysan</span>
                </div>
                <p className="text-[6px] font-black uppercase tracking-[0.2em] text-emerald-600">Institutional Identity Card</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-3">
                <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-2xl rounded-2xl">
                        <AvatarImage src={member.photo_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-3xl">
                            {name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                        {role}
                    </div>
                </div>

                <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                        {name}
                    </h4>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {dept}
                    </p>
                </div>

                <div className="w-full space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-slate-400 uppercase">ID No</span>
                        <span className="text-[8px] font-black font-mono text-slate-900 dark:text-white">{subId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-slate-400 uppercase">Valid Thru</span>
                        <span className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">March 2027</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-900 text-white mt-auto">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-left">
                        <p className="text-[5px] font-black text-slate-400 uppercase leading-none">Emergency Contact</p>
                        <p className="text-[7px] font-bold tracking-tighter">+91 98765 43210</p>
                    </div>
                    <div className="h-8 w-8 bg-white dark:bg-slate-900 p-0.5 rounded-xl">
                        <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] opacity-50" />
                    </div>
                </div>
            </div>

            <div className="absolute top-0 right-0 h-16 w-16 bg-slate-900/5 -translate-y-1/2 translate-x-1/2 rotate-45 rounded-full" />
        </div>
    );
}
