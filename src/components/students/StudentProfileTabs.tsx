"use client";

import { useState } from "react";
import { 
    User, Mail, Phone, MapPin, Calendar, GraduationCap, 
    FileText, DollarSign, ClipboardCheck, Upload, 
    Download, Printer, Edit3, CheckCircle2, XCircle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
        { id: "academics", label: "Academics", icon: GraduationCap },
        { id: "attendance", label: "Attendance", icon: ClipboardCheck },
        { id: "fees", label: "Fee History", icon: DollarSign },
        { id: "documents", label: "Documents", icon: FileText },
    ];

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {tabItems.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Edit3 className="h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Profile Card */}
                        <Card className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                                    <User className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold">
                                    {student.profile?.first_name} {student.profile?.last_name}
                                </h2>
                                <p className="text-sm text-slate-500">Class: {student.class?.name || "N/A"}</p>
                                <Badge className={student.status === "active" ? "bg-emerald-100 text-emerald-700 mt-2" : "bg-slate-100"}>
                                    {student.status || "Active"}
                                </Badge>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t space-y-3">
                                {student.profile?.email && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{student.profile.email}</span>
                                    </div>
                                )}
                                {student.profile?.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{student.profile.phone}</span>
                                    </div>
                                )}
                                {student.profile?.address && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{student.profile.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500">Admission No.</p>
                                    <p className="font-mono font-semibold">{student.admission_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Roll Number</p>
                                    <p className="font-mono font-semibold">{student.roll_number || "—"}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Stats Cards */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-4 border-l-4 border-l-emerald-500">
                                    <p className="text-xs font-medium text-slate-500 uppercase">Attendance Rate</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-3xl font-bold">{attendanceRate}%</span>
                                        {attendanceRate >= 75 ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                </Card>
                                <Card className="p-4 border-l-4 border-l-blue-500">
                                    <p className="text-xs font-medium text-slate-500 uppercase">Academic Score</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-3xl font-bold">{avgGrade}%</span>
                                        <GraduationCap className="h-5 w-5 text-blue-500" />
                                    </div>
                                </Card>
                                <Card className="p-4 border-l-4 border-l-amber-500">
                                    <p className="text-xs font-medium text-slate-500 uppercase">Total Records</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-3xl font-bold">{attendance.length + grades.length}</span>
                                        <FileText className="h-5 w-5 text-amber-500" />
                                    </div>
                                </Card>
                            </div>

                            {/* Quick Info Grid */}
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs">Gender</p>
                                        <p className="font-medium">{student.gender || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Date of Birth</p>
                                        <p className="font-medium">{student.date_of_birth || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Category</p>
                                        <p className="font-medium">{student.category || "General"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Religion</p>
                                        <p className="font-medium">{student.religion || "—"}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="academics" className="mt-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Academic Performance</h3>
                        {grades.length > 0 ? (
                            <div className="space-y-3">
                                {grades.map((grade: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                                                {Math.round((grade.marks_obtained / (grade.exam?.max_marks || 100)) * 100)}%
                                            </div>
                                            <div>
                                                <p className="font-medium">{grade.exam?.name || "Term Evaluation"}</p>
                                                <p className="text-xs text-slate-500">
                                                    Marks: {grade.marks_obtained} / {grade.exam?.max_marks || 100}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">Reported</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-8">No exam results recorded</p>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">Attendance History</h3>
                        {attendance.length > 0 ? (
                            <div className="space-y-3">
                                {attendance.map((record: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                record.status === "present" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                            )}>
                                                {record.status === "present" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {record.status === "present" ? "Present" : "Absent"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                                            {record.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-8">No attendance records found</p>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="fees" className="mt-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Fee Payment History</h3>
                            <Button size="sm" className="bg-emerald-600">Pay Fee</Button>
                        </div>
                        <p className="text-center text-slate-500 py-8">Fee records will be displayed here</p>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Student Documents</h3>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                        <div className="text-center text-slate-500 py-8">No documents uploaded</div>
                    </Card>
                </TabsContent>
            </Tabs>

            {children}
        </div>
    );
}