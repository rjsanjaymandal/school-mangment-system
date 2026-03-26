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
                <div className="flex items-center gap-x-6">
                    <Button variant="ghost" size="icon" asChild className="h-14 w-14 rounded-sm bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                        <Link href="/students">
                            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-x-3 mb-4">
                            <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                Personnel Node: {id.slice(0, 8)}
                            </div>
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic">Verification: Master Registry</span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Profile <span className="text-primary tracking-normal not-italic">/</span> {student.profile?.first_name}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-x-4">
                    <Button className="h-14 rounded-sm bg-white/5 border border-white/5 font-black uppercase tracking-[0.2em] text-[10px] px-8 hover:bg-white/10 transition-all">
                        Edit Records
                    </Button>
                    <Button className="h-14 rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] px-8 emerald-border-glow shadow-2xl">
                        Generate Transcript
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Left Pillar: Identity */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="relative group glass-card p-10 transition-all duration-700 hover:emerald-border-glow overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 h-48 w-48 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                            <User className="h-full w-full" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="relative h-32 w-32 rounded-sm bg-white/5 border border-white/10 p-2 group-hover:emerald-border-glow transition-all duration-700 skew-x-[-4deg]">
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-xl">
                                    {student.status || "Active"}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">
                                    {student.profile?.first_name} {student.profile?.last_name}
                                </h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3">Level: {student.class?.name || "Unranked"}</p>
                            </div>
                        </div>

                        <div className="space-y-5 mt-10 pt-10 border-t border-white/5 relative z-10">
                            <div className="flex items-center gap-x-4 text-foreground/50 group/item hover:text-primary transition-colors cursor-pointer">
                                <Mail className="h-4 w-4 text-primary/40 group-hover/item:text-primary" />
                                <span className="text-[11px] font-black uppercase tracking-widest truncate">{student.profile?.email}</span>
                            </div>
                            {student.profile?.phone && (
                                <div className="flex items-center gap-x-4 text-foreground/50 group/item hover:text-primary transition-colors cursor-pointer">
                                    <Phone className="h-4 w-4 text-primary/40 group-hover/item:text-primary" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{student.profile?.phone}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-x-4 text-foreground/50 group/item hover:text-primary transition-colors cursor-pointer">
                                <MapPin className="h-4 w-4 text-primary/40 group-hover/item:text-primary shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                                    {student.profile?.address || "Location Masked"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 border-dashed border-2 border-primary/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">System Meta</h4>
                            <Hash className="h-3 w-3 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Entry ID</span>
                                <span className="text-[10px] font-mono font-black text-primary">{student.admission_number}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Registry PIN</span>
                                <span className="text-[10px] font-mono font-black text-primary">{student.roll_number || "PENDING"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-12">
                    {/* Key Metrics Ribbon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 border-l-4 border-l-primary group">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Attendance Integrity</p>
                            <div className="flex items-baseline gap-x-4">
                                <span className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                    {attendanceRate}%
                                </span>
                                <CheckCircle2 className="h-6 w-6 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="glass-card p-8 border-l-4 border-l-emerald-500 group">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">Academic Index</p>
                            <div className="flex items-baseline gap-x-4">
                                <span className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-emerald-500 transition-colors">
                                    {avgGrade}%
                                </span>
                                <TrendingUp className="h-6 w-6 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="glass-card p-8 border-l-4 border-l-orange-500 group">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 mb-4">Record History</p>
                            <div className="flex items-baseline gap-x-4">
                                <span className="text-5xl font-black italic tracking-tighter text-foreground group-hover:text-orange-500 transition-colors">
                                    {attendance.length + grades.length}
                                </span>
                                <Clock className="h-6 w-6 text-orange-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Records */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                        {/* Attendance Timeline */}
                        <div className="relative glass-panel p-2 rounded-sm overflow-hidden border border-white/10">
                            <div className="bg-background/40 backdrop-blur-3xl p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">Attendance Loop</h3>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mt-2">Historical Presence Audit</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase rounded-none border-primary/20 text-primary">Live Sync</Badge>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                                    {attendance.length > 0 ? (
                                        attendance.map((record, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 rounded-sm bg-white/5 border border-white/5 hover:border-primary/40 transition-all group">
                                                <div className="flex items-center gap-x-5">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-sm flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                                                        record.status === 'present' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    )}>
                                                        {record.status === 'present' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest italic text-foreground group-hover:text-primary transition-colors">
                                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 mt-1">{record.status === 'present' ? "AUTHENTICATED" : "ABSENT RECORDED"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 text-center py-12">No attendance cycles recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Academic Summary */}
                        <div className="relative glass-panel p-2 rounded-sm overflow-hidden border border-white/10">
                            <div className="bg-background/40 backdrop-blur-3xl p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none">Academic Node</h3>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-2">Masters Evaluation Stream</p>
                                    </div>
                                    <FileText className="h-4 w-4 text-emerald-500 animate-pulse" />
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                                    {grades.length > 0 ? (
                                        grades.map((grade, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 rounded-sm bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-all group">
                                                <div className="flex items-center gap-x-5">
                                                    <div className="h-10 w-10 rounded-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-black italic text-xs shadow-lg group-hover:emerald-border-glow-sm transition-all">
                                                        {(grade.marks_obtained / (grade.exam?.max_marks || 100) * 100).toFixed(0)}%
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest italic text-foreground group-hover:text-emerald-500 transition-colors">
                                                            {grade.exam?.name || "Term Alpha Evaluation"}
                                                        </p>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 mt-1">Raw: {grade.marks_obtained} / {grade.exam?.max_marks}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase skew-x-[-12deg] border-emerald-500/20 text-emerald-500">Validated</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 text-center py-12">No evaluation fragments detected.</p>
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
