import { InstitutionalService } from "@/lib/services/institutional";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Hash,
    ArrowLeft,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    FileText
} from "lucide-react";
import Link from "next/link";
import { getStudentResults } from "@/app/actions/exams";
import { getStudentAttendance } from "@/app/actions/attendance";
import { cn } from "@/lib/utils";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await InstitutionalService.getStudentById(id);

    if (!student) {
        notFound();
    }

    // Fetch integrated data
    const resultsResponse = await getStudentResults(id);
    const attendanceResponse = await getStudentAttendance(id);

    const grades = resultsResponse.success ? resultsResponse.data : [];
    const attendance = attendanceResponse.success ? attendanceResponse.data : [];

    // Calculate basic stats
    const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
        : 0;

    const avgGrade = grades.length > 0
        ? Math.round(grades.reduce((acc, g) => acc + g.marks_obtained, 0) / grades.length)
        : 0;

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
                <div className="flex items-center gap-x-4">
                    <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-md border-border bg-card shadow-sm hover:bg-secondary transition-all group">
                        <Link href="/students">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-x-2 mb-2">
                            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                Student ID: {id.slice(0, 8)}
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Verified Profile</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground leading-none">
                            {student.profile?.first_name} {student.profile?.last_name}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-x-3">
                    <Button variant="outline" className="h-10 rounded-md font-semibold text-xs tracking-wide px-4 border-border shadow-sm">
                        Edit Profile
                    </Button>
                    <Button className="h-10 rounded-md bg-primary text-primary-foreground font-semibold text-xs tracking-wide px-6 shadow-sm hover:opacity-90">
                        Generate Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Left Pillar: Identity */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card p-8 border border-border rounded-lg shadow-sm">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative h-24 w-24 rounded-full bg-secondary border border-border p-1">
                                <div className="h-full w-full rounded-full bg-primary/5 flex items-center justify-center">
                                    <User className="h-12 w-12 text-primary/40" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                                    {student.status || "Active"}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-foreground tracking-tight">
                                    {student.profile?.first_name} {student.profile?.last_name}
                                </h3>
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-1.5">Class: {student.class?.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-8 pt-6 border-t border-border/50">
                            <div className="flex items-center gap-x-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                <Mail className="h-3.5 w-3.5 text-primary/40" />
                                <span className="text-[10px] font-semibold tracking-wide truncate">{student.profile?.email}</span>
                            </div>
                            {student.profile?.phone && (
                                <div className="flex items-center gap-x-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    <Phone className="h-3.5 w-3.5 text-primary/40" />
                                    <span className="text-[10px] font-semibold tracking-wide">{student.profile?.phone}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-x-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                <MapPin className="h-3.5 w-3.5 text-primary/40 shrink-0" />
                                <span className="text-[10px] font-semibold tracking-wide leading-relaxed">
                                    {student.profile?.address || "No Address Provided"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 border border-border rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Information</h4>
                            <Hash className="h-3 w-3 text-primary/40" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Admission No.</span>
                                <span className="text-[10px] font-mono font-bold text-foreground">{student.admission_number}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Roll Number</span>
                                <span className="text-[10px] font-mono font-bold text-foreground">{student.roll_number || "—"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-12">
                    {/* Key Metrics Ribbon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card p-6 border border-border rounded-lg shadow-sm border-l-4 border-l-primary transition-all hover:border-r-primary/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3">Attendance Rate</p>
                            <div className="flex items-baseline gap-x-3">
                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                    {attendanceRate}%
                                </span>
                                <CheckCircle2 className="h-5 w-5 text-primary opacity-20" />
                            </div>
                        </div>
                        <div className="bg-card p-6 border border-border rounded-lg shadow-sm border-l-4 border-l-emerald-500 transition-all hover:border-r-emerald-500/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-3">Academic Score</p>
                            <div className="flex items-baseline gap-x-3">
                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                    {avgGrade}%
                                </span>
                                <TrendingUp className="h-5 w-5 text-emerald-500 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-card p-6 border border-border rounded-lg shadow-sm border-l-4 border-l-orange-500 transition-all hover:border-r-orange-500/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-3">Total Activities</p>
                            <div className="flex items-baseline gap-x-3">
                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                    {attendance.length + grades.length}
                                </span>
                                <Clock className="h-5 w-5 text-orange-500 opacity-20" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Records */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        {/* Attendance Timeline */}
                        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Attendance Log</h3>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mt-1">Presence History</p>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold tracking-wider uppercase text-primary">Live</div>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                    {attendance.length > 0 ? (
                                        attendance.map((record, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-md bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group">
                                                <div className="flex items-center gap-x-4">
                                                    <div className={cn(
                                                        "h-9 w-9 rounded-md flex items-center justify-center transition-all shadow-sm",
                                                        record.status === 'present' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    )}>
                                                        {record.status === 'present' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-0.5">{record.status === 'present' ? "Present" : "Absent"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 text-center py-12">No attendance records found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Academic Summary */}
                        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Examination Records</h3>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mt-1">Academic Performance</p>
                                    </div>
                                    <FileText className="h-4 w-4 text-emerald-500/40" />
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                    {grades.length > 0 ? (
                                        grades.map((grade, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-md bg-muted/30 border border-border/50 hover:border-emerald-500/30 transition-all group">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shadow-sm">
                                                        {(grade.marks_obtained / (grade.exam?.max_marks || 100) * 100).toFixed(0)}%
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                                                            {grade.exam?.name || "Term Evaluation"}
                                                        </p>
                                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-0.5">Marks: {grade.marks_obtained} / {grade.exam?.max_marks}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] font-bold tracking-wider uppercase border-emerald-500/20 text-emerald-600 rounded-full">Reported</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 text-center py-12">No exam results recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
