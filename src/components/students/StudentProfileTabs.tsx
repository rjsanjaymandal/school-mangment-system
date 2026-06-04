"use client";

import { useState } from "react";
import { 
    User, Mail, Phone, MapPin, Calendar, GraduationCap, 
    FileText, IndianRupee, ClipboardCheck, Upload, 
    Download, Printer, Edit3, CheckCircle2, XCircle,
    Activity, ShieldCheck, TrendingUp, BarChart3,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
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

    const fullName = student.profile?.full_name || `${student.profile?.first_name || ""} ${student.profile?.last_name || ""}`.trim() || "Unknown";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Profile Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-black text-emerald-600">{fullName[0]?.toUpperCase() || "?"}</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Class {student.class?.name || "N/A"}</span>
                        <span className="h-3 w-px bg-slate-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Adm: {student.admission_number || "SYS-000"}</span>
                        <span className="h-3 w-px bg-slate-200" />
                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", student.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                            {student.status || "Active"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-fit overflow-x-auto max-w-full">
                    {tabItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all",
                                activeTab === tab.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="h-4 w-4 mr-2 inline-block" />
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 transition-all flex items-center gap-2 flex-1 md:flex-none">
                        <Printer className="h-4 w-4" />
                        Print Report
                    </button>
                </div>
            </div>

            {activeTab === "overview" && (
                <div className="outline-none animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Profile Info</h3>
                                        <p className="text-[10px] text-slate-500">Core student details</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-24 w-24 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mb-4">
                                        <User className="h-12 w-12 text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {student.profile?.first_name} {student.profile?.last_name}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class {student.class?.name || "N/A"}</p>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mt-3",
                                        student.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {student.status || "Active Member"}
                                    </span>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">{student.profile?.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span>{student.profile?.phone || "No phone"}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
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
                                        <p className="font-mono font-black text-slate-900 text-xs">{student.roll_number || "\u2014"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

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

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-1.5 rounded bg-blue-50 text-blue-600">
                                            <BarChart3 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
                                            <p className="text-[10px] text-slate-500">Basic student demographic information</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        <MetadataItem label="Gender" value={student.gender} />
                                        <MetadataItem label="Date of Birth" value={student.date_of_birth} />
                                        <MetadataItem label="Category" value={student.category || "General"} />
                                        <MetadataItem label="Religion" value={student.religion} />
                                        <MetadataItem label="Blood Group" value={student.blood_group} />
                                        <MetadataItem label="Nationality" value={student.nationality || "Indian"} />
                                        <MetadataItem label="Mother Tongue" value={student.mother_tongue} />
                                        <MetadataItem label="Guardian Name" value={student.profile?.father_name || "\u2014"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "academics" && (
                <div className="outline-none animate-in fade-in duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 rounded bg-blue-50 text-blue-600">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Academic Record</h3>
                                    <p className="text-[10px] text-slate-500">Past exam results and term evaluations</p>
                                </div>
                            </div>
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
                                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">Verified</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <GraduationCap className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No exam records</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "attendance" && (
                <div className="outline-none animate-in fade-in duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                                    <ClipboardCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Attendance History</h3>
                                    <p className="text-[10px] text-slate-500">Daily record of institutional presence</p>
                                </div>
                            </div>
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
                                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                record.status === "present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
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
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "fees" && (
                <div className="outline-none animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <DashboardStatCard title="Total Paid" value={`₹${(grades as any)?.totalPaid || 0}`} icon={IndianRupee} color="emerald" description="Lifetime payments" />
                        <DashboardStatCard title="Pending Dues" value={`₹${(grades as any)?.pendingDues || 0}`} icon={AlertCircle} color="amber" description="Outstanding amount" />
                        <DashboardStatCard title="Last Payment" value={(grades as any)?.lastPaymentDate || "—"} icon={Activity} color="blue" description="Most recent" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                                    <IndianRupee className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Fee Payment History</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Complete financial record</p>
                                </div>
                            </div>
                            <div className="text-center py-12">
                                <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Fee data will appear once integrated</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "documents" && (
                <div className="outline-none animate-in fade-in duration-500">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1.5 rounded bg-blue-50 text-blue-600">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Student Documents</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Uploaded files and records</p>
                                </div>
                            </div>
                            <div className="text-center py-12">
                                <Upload className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No documents uploaded</p>
                                <button className="mt-4 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all inline-flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {children}
        </div>
    );
}

function MetadataItem({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
            <p className="text-[11px] font-bold text-slate-900 tracking-tight">{value || "\u2014"}</p>
        </div>
    );
}