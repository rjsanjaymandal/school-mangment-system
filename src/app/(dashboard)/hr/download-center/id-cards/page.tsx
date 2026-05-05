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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getIDCardData } from "@/app/actions/hr";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        // If type is student and class is selected, we fetch by class. 
        // For simplicity, we fetch all active if class is 'all'
        const result = await getIDCardData(targetType, selectedClass);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            setIdCards(result.data);
            setPreviewMode(true);
            toast.success("ID Cards generated for " + result.data.members.length + " members");
        }
    };

    if (previewMode && idCards) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setPreviewMode(false)} className="rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight italic">ID Card Preview</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{idCards.members.length} Cards Generated</p>
                        </div>
                    </div>
                    <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-bold px-8">
                        <Printer className="h-4 w-4" /> Print ID Cards
                    </Button>
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
        <div className="space-y-8 max-w-4xl mx-auto p-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/hr/download-center">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Identity Card Generator</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">High-Fidelity CR80 Card Production</p>
                    </div>
                </div>
            </div>

            <ERPCard accentColor="emerald" className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Type</Label>
                        <Select onValueChange={(v: any) => setTargetType(v)} value={targetType}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-200">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student Identity Card</SelectItem>
                                <SelectItem value="staff">Staff Identity Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Filter / Group</Label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger className="rounded-xl h-12 border-slate-200">
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Active {targetType === 'student' ? 'Students' : 'Staff'}</SelectItem>
                                {targetType === 'student' && classes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>Class: {c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12 h-14 font-black italic tracking-tight gap-3 shadow-xl shadow-emerald-600/20"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                        Generate ID Cards
                    </Button>
                </div>
            </ERPCard>
        </div>
    );
}

function IDCardTemplate({ member, type, settings }: { member: any, type: string, settings: any }) {
    const isStudent = type === 'student';
    const name = isStudent ? member.full_name : `${member.first_name} ${member.last_name}`;
    const subId = isStudent ? member.admission_number : member.staff_id;
    const dept = isStudent ? member.class?.name : member.department?.name;
    const role = isStudent ? "Student" : member.designation?.name;

    return (
        <div className="w-[240px] aspect-[1/1.58] bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden flex flex-col print-area mx-auto bg-gradient-to-b from-white to-slate-50">
            {/* Top Bar */}
            <div className="bg-slate-900 h-2" />
            
            {/* Header */}
            <div className="p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="h-5 w-5 bg-slate-900 rounded-sm flex items-center justify-center">
                        <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">Edu Maysan</span>
                </div>
                <p className="text-[6px] font-black uppercase tracking-[0.2em] text-emerald-600">Institutional Identity Card</p>
            </div>

            {/* Photo Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-3">
                <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-2xl rounded-2xl">
                        <AvatarImage src={member.photo_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-3xl">
                            {name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                        {role}
                    </div>
                </div>

                <div className="text-center space-y-0.5">
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
                        {name}
                    </h4>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {dept}
                    </p>
                </div>

                <div className="w-full space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-slate-400 uppercase">ID No</span>
                        <span className="text-[8px] font-black font-mono text-slate-900">{subId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-slate-400 uppercase">Valid Thru</span>
                        <span className="text-[8px] font-black text-slate-900 uppercase tracking-tighter">March 2027</span>
                    </div>
                </div>
            </div>

            {/* Footer / QR / Signature */}
            <div className="p-4 bg-slate-900 text-white mt-auto">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-left">
                        <p className="text-[5px] font-black text-slate-400 uppercase leading-none">Emergency Contact</p>
                        <p className="text-[7px] font-bold tracking-tighter">+91 98765 43210</p>
                    </div>
                    <div className="h-8 w-8 bg-white p-0.5 rounded-sm">
                        <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_3px)] opacity-50" />
                    </div>
                </div>
            </div>

            {/* Print Decoration */}
            <div className="absolute top-0 right-0 h-16 w-16 bg-slate-900/5 -translate-y-1/2 translate-x-1/2 rotate-45 rounded-full" />
        </div>
    );
}
