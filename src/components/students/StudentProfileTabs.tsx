"use client";

import { useState } from "react";
import { 
    User, Mail, Phone, MapPin, Calendar, GraduationCap, 
    FileText, IndianRupee, ClipboardCheck, Upload, 
    Download, Printer, Edit3, CheckCircle2, XCircle,
    Activity, ShieldCheck, TrendingUp, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Shared UI Framework
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface StudentProfileTabsProps {
    student: any;
    grades: any[];
    attendance: any[];
    children?: React.ReactNode;
}

export function StudentProfileTabs({ student, grades, attendance, children }: StudentProfileTabsProps) {
    const [activeTab, setActiveTab] = useState("overview");

    const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100)
        : 0;

    const avgGrade = grades.length > 0
        ? Math.round(grades.reduce((acc: number, g: any) => acc + g.marks_obtained, 0) / grades.length)
        : 0;

    const tabItems = [
        { id: "overview", label: "Overview", icon: User },
        { id: "academics", label: "Grades", icon: GraduationCap },
        { id: "attendance", label: "Attendance", icon: ClipboardCheck },
        { id: "fees", label: "Finance", icon: IndianRupee },
        { id: "documents", label: "Documents", icon: FileText },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-150">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <TabsList className="bg-slate-100/50 backdrop-blur-sm p-1 rounded-xl h-auto border border-slate-200/60 w-fit overflow-x-auto max-w-full">
                        {tabItems.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-[0.1em]"
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none h-10 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all active:scale-95 gap-2">
                            <Printer className="h-4 w-4" />
                            Print Report
                        </Button>
                    </div>
                </div>

                <TabsContent value="overview" className="mt-8 outline-none animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Profile Persona */}
                        <ERPCard
                            title="Profile Info"
                            description="Core student details"
                            icon={<ShieldCheck className="h-5 w-5" />}
                            color="emerald"
                            className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                                    <User className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {student.profile?.first_name} {student.profile?.last_name}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class {student.class?.name || "N/A"}</p>
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border mt-3",
                                    student.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                )}>
                                    {student.status || "Active Member"}
                                </span>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="truncate">{student.profile?.email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <span>{student.profile?.phone || "No phone"}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span className="truncate">{student.profile?.address || "No address"}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Admission #</p>
                                    <p className="font-mono font-black text-slate-900 text-xs">{student.admission_number || "SYS-000"}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Roll #</p>
                                    <p className="font-mono font-black text-slate-900 text-xs">{student.roll_number || "—"}</p>
                                </div>
                            </div>
                        </ERPCard>

                        {/* Analytics */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DashboardStatCard 
                                    title="Attendance Rate" 
                                    value={`${attendanceRate}%`} 
                                    icon={ClipboardCheck} 
                                    color={attendanceRate >= 75 ? "emerald" : "rose"} 
                                    description={attendanceRate >= 75 ? "Target met" : "Below target"}
                                />
                                <DashboardStatCard 
                                    title="Average Grade" 
                                    value={`${avgGrade}%`} 
                                    icon={GraduationCap} 
                                    color="blue" 
                                    description="Aggregate score"
                                />
                                <DashboardStatCard 
                                    title="Total Logs" 
                                    value={attendance.length + grades.length} 
                                    icon={Activity} 
                                    color="amber" 
                                    description="Historical records"
                                />
                            </div>

                            {/* Institutional Metadata */}
                            <ERPCard
                                title="Personal Details"
                                description="Basic student demographic information"
                                icon={<BarChart3 className="h-5 w-5" />}
                                color="blue"
                                className="glass futuristic-card border-none shadow-xl rounded-2xl p-8"
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <MetadataItem label="Gender" value={student.gender} />
                                    <MetadataItem label="Date of Birth" value={student.date_of_birth} />
                                    <MetadataItem label="Category" value={student.category || "General"} />
                                    <MetadataItem label="Religion" value={student.religion} />
                                    <MetadataItem label="Blood Group" value={student.blood_group} />
                                    <MetadataItem label="Nationality" value={student.nationality || "Indian"} />
                                    <MetadataItem label="Mother Tongue" value={student.mother_tongue} />
                                    <MetadataItem label="Guardian Name" value={student.profile?.father_name || "—"} />
                                </div>
                            </ERPCard>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="academics" className="mt-8 outline-none animate-in fade-in zoom-in-95 duration-500">
                    <ERPCard
                        title="Academic Record"
                        description="Past exam results and term evaluations"
                        icon={<TrendingUp className="h-5 w-5" />}
                        color="blue"
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                    >
                        {grades.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {grades.map((grade: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-black text-sm">
                                                {Math.round((grade.marks_obtained / (grade.exam?.max_marks || 100)) * 100)}%
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{grade.exam?.name || "Exam"}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                    Score: {grade.marks_obtained} / {grade.exam?.max_marks || 100}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-md border bg-blue-50 text-blue-600 border-blue-100 tracking-tighter">Verified</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <GraduationCap className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No exam records</p>
                            </div>
                        )}
                    </ERPCard>
                </TabsContent>

                <TabsContent value="attendance" className="mt-8 outline-none animate-in fade-in zoom-in-95 duration-500">
                    <ERPCard
                        title="Attendance History"
                        description="Daily record of institutional presence"
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        color="emerald"
                        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
                    >
                        {attendance.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {attendance.map((record: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center border",
                                                record.status === "present" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                            )}>
                                                {record.status === "present" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">
                                                    {new Date(record.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                    Status: {record.status}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase px-2.5 py-1 rounded-md border tracking-tighter",
                                            record.status === "present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <ClipboardCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No attendance records</p>
                            </div>
                        )}
                    </ERPCard>
                </TabsContent>

                {/* Other tabs can be similarly modernized if content is added */}
                <TabsContent value="fees" className="mt-8 outline-none">
                     <ERPCard title="Finance" description="Payment and billing history" icon={<IndianRupee className="h-5 w-5" />} color="emerald" className="glass futuristic-card border-none shadow-xl rounded-2xl p-12 text-center">
                         <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading financial data...</p>
                     </ERPCard>
                </TabsContent>

                <TabsContent value="documents" className="mt-8 outline-none">
                     <ERPCard title="Documents" description="Student certificates and uploads" icon={<FileText className="h-5 w-5" />} color="blue" className="glass futuristic-card border-none shadow-xl rounded-2xl p-12 text-center">
                         <ShieldCheck className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No documents found</p>
                     </ERPCard>
                </TabsContent>
            </Tabs>

            {children}
        </div>
    );
}

function MetadataItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
            <p className="text-[11px] font-bold text-slate-900 tracking-tight">{value || "—"}</p>
        </div>
    );
}