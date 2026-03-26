"use client";

import { useState } from "react";
import {
    FileText, Plus, ClipboardCheck, Calendar, Award, BookOpen, Users, BarChart3, Pencil, Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as BigCalendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-overrides.css"; // We will create this for glassmorphism
import { createExam, deleteExam, saveMarks, getMarksByExam } from "@/app/actions/exams";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ExamsDashboardProps {
    exams: any[];
    classes: any[];
    subjects: any[];
    academicYears: any[];
    students: any[];
    userRole: string;
}

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export function ExamsDashboard({ exams, classes, subjects, academicYears, students, userRole }: ExamsDashboardProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isMarksOpen, setIsMarksOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [existingMarks, setExistingMarks] = useState<any[]>([]);
    const [calendarView, setCalendarView] = useState<View>("month");

    const currentAY = academicYears.find((ay: any) => ay.is_current) || academicYears[0];

    const [examForm, setExamForm] = useState({
        name: "", subject_id: "", class_id: "", date: "", max_marks: "100", passing_marks: "35",
        academic_year_id: currentAY?.id || "",
    });

    const handleCreateExam = async () => {
        setLoading(true);
        const result = await createExam({
            ...examForm,
            max_marks: parseInt(examForm.max_marks) || 100,
            passing_marks: parseInt(examForm.passing_marks) || 35,
        });
        setLoading(false);
        if (result.success) {
            setIsCreateOpen(false);
            setExamForm({ name: "", subject_id: "", class_id: "", date: "", max_marks: "100", passing_marks: "35", academic_year_id: currentAY?.id || "" });
            router.refresh();
        }
    };

    const handleDeleteExam = async (id: string) => {
        setLoading(true);
        await deleteExam(id);
        setLoading(false);
        router.refresh();
    };

    const handleOpenMarks = async (exam: any) => {
        setSelectedExam(exam);
        setLoading(true);
        const result = await getMarksByExam(exam.id);
        if (result.success && result.data) {
            setExistingMarks(result.data);
            const marksObj: Record<string, string> = {};
            result.data.forEach((m: any) => { marksObj[m.student_id] = String(m.marks_obtained); });
            setMarks(marksObj);
        }
        setLoading(false);
        setIsMarksOpen(true);
    };

    const handleSaveMarks = async () => {
        if (!selectedExam) return;
        setLoading(true);
        const marksArr = Object.entries(marks)
            .filter(([_, v]) => v !== "")
            .map(([studentId, obtained]) => ({
                exam_id: selectedExam.id,
                student_id: studentId,
                subject_id: selectedExam.subject_id,
                marks_obtained: parseInt(obtained) || 0,
            }));
        await saveMarks(marksArr);
        setLoading(false);
        setIsMarksOpen(false);
        router.refresh();
    };

    const examStudents = selectedExam
        ? students.filter((s: any) => s.class_id === selectedExam.class_id)
        : [];

    const upcoming = exams.filter(e => new Date(e.date) >= new Date());
    const completed = exams.filter(e => new Date(e.date) < new Date());

    const calendarEvents = exams.map(e => {
        // Assume exams default to a standard time if we only have dates
        const dateStr = e.date;
        const start = new Date(dateStr);
        start.setHours(9, 0, 0); // Default to 9 AM
        const end = new Date(dateStr);
        end.setHours(12, 0, 0); // Default 3 hours

        return {
            id: e.id,
            title: `${e.name} (${e.class?.name || "N/A"})`,
            start,
            end,
            resource: e,
        };
    });

    return (
        <div className="space-y-12 reveal-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-primary/10 pb-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-20 w-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(16,185,129,0.15)] skew-x-[-12deg] group hover:bg-primary hover:text-primary-foreground transition-all duration-700">
                        <Award className="h-10 w-10 skew-x-[12deg] transition-all duration-700" />
                    </div>
                    <div>
                        <div className="relative">
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">Exam <span className="text-primary italic">Management</span></h1>
                            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-primary/40 skew-x-[-24deg]" />
                        </div>
                        <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> Manage School Examinations
                        </p>
                    </div>
                </div>

                {(userRole === "admin" || userRole === "teacher") && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="group relative h-16 px-12 bg-primary/10 text-primary font-black rounded-none border border-primary/20 hover:bg-primary/20 transition-all duration-500 skew-x-[-12deg] overflow-hidden"
                    >
                        <span className="relative z-10 skew-x-[12deg] flex items-center gap-x-4 uppercase tracking-[0.2em] text-[10px]">
                            Create Exam
                            <Plus className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
                        </span>
                        <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20" />
                    </Button>
                )}
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="bg-white/[0.02] p-2 rounded-none h-20 border border-primary/10 skew-x-[-8deg] mb-12 flex items-center gap-2">
                    <TabsTrigger value="list" className="h-16 px-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 not-skew-x rounded-none border border-transparent data-[state=active]:emerald-glow italic">
                        <span className="flex items-center gap-x-3">
                            <ClipboardCheck className="h-4 w-4" /> Exam List
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="h-16 px-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 not-skew-x rounded-none border border-transparent data-[state=active]:emerald-glow italic text-foreground/40">
                        <span className="flex items-center gap-x-3">
                            <Calendar className="h-4 w-4" /> Exam Calendar
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { label: "Total Exams", value: exams.length, icon: FileText, width: "78%" },
                            { label: "Active Participants", value: students.length, icon: Users, width: "92%" },
                            { label: "Subject Coverage", value: new Set(exams.map(e => e.subject_id)).size, icon: BookOpen, width: "64%" },
                            { label: "Current Cycle", value: "Verified", icon: Calendar, width: "100%" },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-10 relative overflow-hidden group hover:emerald-border-glow transition-all duration-700 skew-x-[-12deg] rounded-none border-primary/10">
                                <div className="not-skew-x relative z-10">
                                    <stat.icon className="absolute right-[-20px] bottom-[-20px] h-24 w-24 text-primary opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700" />
                                    <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary/60 mb-6 italic">{stat.label}</p>
                                    <h3 className="text-6xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-all duration-500 leading-none">
                                        {stat.value}
                                    </h3>
                                    <div className="h-[2px] w-full bg-white/5 mt-8 overflow-hidden">
                                        <div 
                                            className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                                            style={{ width: stat.width }} 
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 h-10 w-10 border-t border-r border-primary/20 group-hover:border-primary/60 transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel p-2 rounded-none border border-primary/10 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-primary/5">
                                <tr>
                                    <th className="px-12 py-8 text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-none bg-primary" /> Exam Name
                                        </div>
                                    </th>
                                    <th className="px-12 py-8 text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Class</th>
                                    <th className="px-12 py-8 text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Date</th>
                                    <th className="px-12 py-8 text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Total Marks</th>
                                    <th className="px-12 py-8 text-right text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 font-medium tracking-tight">
                                {exams.map((exam) => (
                                    <tr key={exam.id} className="group hover:bg-primary/[0.02] transition-all duration-500">
                                        <td className="px-12 py-10">
                                            <div>
                                                <p className="font-black text-foreground uppercase italic tracking-tighter text-xl group-hover:text-primary transition-colors leading-none mb-3">
                                                    {exam.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-3 w-3 text-primary/40" />
                                                    <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground/40">{exam.subject?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="h-10 px-6 bg-primary/5 border border-primary/10 flex items-center justify-center font-mono font-black text-[11px] uppercase tracking-widest text-foreground group-hover:border-primary/40 transition-all w-fit skew-x-[-12deg]">
                                                <span className="not-skew-x flex items-center gap-2">
                                                    <Users className="h-3 w-3 text-primary" />
                                                    {exam.class?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-mono font-black text-[12px] uppercase tracking-[0.2em] text-foreground italic">
                                                    {format(new Date(exam.date), "dd-MM-yyyy")}
                                                </p>
                                                <p className="text-[9px] font-mono font-black uppercase tracking-widest text-primary/30">Schedule Date</p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-x-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-black italic text-foreground tracking-tighter leading-none">{exam.max_marks}</span>
                                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-foreground/20">MAX</span>
                                                </div>
                                                <div className="h-8 w-px bg-primary/20" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-mono font-black uppercase tracking-widest text-primary italic leading-none">{exam.passing_marks}</span>
                                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary/30">PASSING</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className="flex items-center justify-end gap-x-4">
                                                {(userRole === "admin" || userRole === "teacher") && (
                                                    <Button 
                                                        onClick={() => handleOpenMarks(exam)}
                                                        className="h-12 px-8 bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-primary-foreground transition-all duration-500 skew-x-[-12deg] rounded-none group/btn"
                                                    >
                                                        <span className="not-skew-x flex items-center gap-x-3">
                                                            <Plus className="h-4 w-4 group-hover/btn:rotate-90 transition-transform" /> 
                                                            Enter Results
                                                        </span>
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-12 w-12 p-0 text-foreground/30 hover:text-primary hover:bg-primary/10 rounded-none skew-x-[-12deg] border border-transparent hover:border-primary/20"
                                                >
                                                    <Pencil className="h-4 w-4 not-skew-x" />
                                                </Button>
                                                {(userRole === "admin" || userRole === "teacher") && (
                                                    <Button 
                                                        onClick={() => handleDeleteExam(exam.id)}
                                                        variant="ghost" 
                                                        className="h-12 w-12 p-0 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-none skew-x-[-12deg] border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4 not-skew-x" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="calendar">
                    <div className="glass-panel p-8 rounded-sm border border-white/10 overflow-hidden shadow-2xl">
                        <div className="h-[700px] font-black uppercase tracking-widest italic text-[10px]">
                            <BigCalendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
                                className="premium-calendar"
                                views={["month", "week", "agenda"]}
                                view={calendarView}
                                onView={(v) => setCalendarView(v)}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Exam Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="glass-panel border-primary/10 p-0 overflow-hidden max-w-2xl rounded-none shadow-2xl">
                    <div className="p-12 bg-primary/5 border-b border-primary/10 relative overflow-hidden">
                        <Award className="absolute right-[-30px] top-[-30px] h-48 w-48 text-primary opacity-5 rotate-12" />
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                Exam <span className="text-primary italic">Details</span>
                            </h3>
                            <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary" /> Create a new exam
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Exam Name</Label>
                                <Input 
                                    placeholder="E.G. FIRST TERM FINALS" 
                                    className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[12px] uppercase tracking-[0.2em] italic placeholder:text-foreground/10 focus-visible:ring-primary/50 focus-visible:bg-primary/5 skew-x-[-8deg] transition-all"
                                    value={examForm.name} 
                                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Exam Date</Label>
                                <Input 
                                    type="date" 
                                    className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[12px] uppercase tracking-[0.2em] focus-visible:ring-primary/50 focus-visible:bg-primary/5 skew-x-[-8deg] transition-all [&::-webkit-calendar-picker-indicator]:invert"
                                    value={examForm.date} 
                                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Class</Label>
                                <Select onValueChange={(v) => setExamForm({ ...examForm, class_id: v })}>
                                    <SelectTrigger className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[12px] uppercase tracking-[0.2em] italic focus:ring-primary/50 skew-x-[-8deg] transition-all">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-panel border-primary/10 rounded-none">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px] tracking-widest">{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Subject</Label>
                                <Select onValueChange={(v) => setExamForm({ ...examForm, subject_id: v })}>
                                    <SelectTrigger className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[12px] uppercase tracking-[0.2em] italic focus:ring-primary/50 skew-x-[-8deg] transition-all">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-panel border-primary/10 rounded-none">
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id} className="font-black uppercase text-[10px] tracking-widest">{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-primary/5 pt-10">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Maximum Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[14px] uppercase tracking-[0.2em] italic focus-visible:ring-primary/50 focus-visible:bg-primary/5 skew-x-[-8deg] transition-all"
                                    value={examForm.max_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">Passing Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-16 bg-white/[0.03] border-primary/10 rounded-none font-black text-[14px] uppercase tracking-[0.2em] italic focus-visible:ring-primary/50 focus-visible:bg-primary/5 skew-x-[-8deg] transition-all"
                                    value={examForm.passing_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-x-8 pt-12 border-t border-primary/5">
                            <button 
                                type="button" 
                                onClick={() => setIsCreateOpen(false)}
                                className="text-[11px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 hover:text-foreground transition-colors italic group"
                            >
                                <span className="group-hover:mr-2 transition-all">Cancel</span> [ESC]
                            </button>
                            <Button 
                                onClick={handleCreateExam}
                                disabled={loading}
                                className="group relative h-16 px-12 bg-primary text-primary-foreground font-black rounded-none shadow-[0_0_50px_rgba(16,185,129,0.2)] uppercase tracking-[0.3em] text-[10px] skew-x-[-12deg] transition-all hover:scale-105 overflow-hidden border-none"
                            >
                                <span className="not-skew-x relative z-10 flex items-center gap-x-3 italic">
                                    {loading ? "Saving..." : "Save Exam"}
                                    {!loading && <Plus className="h-5 w-5" />}
                                </span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Marks Assessment Dialog */}
            <Dialog open={isMarksOpen} onOpenChange={setIsMarksOpen}>
                <DialogContent className="glass-panel border-primary/10 p-0 overflow-hidden max-w-5xl max-h-[90vh] flex flex-col rounded-none shadow-2xl">
                    <div className="p-12 bg-primary/5 border-b border-primary/10 relative overflow-hidden flex-shrink-0">
                        <ClipboardCheck className="absolute right-[-30px] top-[-30px] h-56 w-56 text-primary opacity-5 rotate-12" />
                        <div className="relative z-10">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                Exam <span className="text-primary italic">Results</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-6 mt-6">
                                <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 italic flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Exam: {selectedExam?.name}
                                </p>
                                <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 italic flex items-center gap-2 border-l border-primary/20 pl-6">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" /> Max Marks: {selectedExam?.max_marks} Points
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="glass-panel p-2 rounded-none border border-primary/10 mb-10 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-primary/10">
                                    <tr>
                                        <th className="px-10 py-8 text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Student Name</th>
                                        <th className="px-10 py-8 text-right text-[11px] font-mono font-black uppercase tracking-[0.5em] text-primary italic border-b border-primary/10">Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5">
                                    {examStudents.length === 0 ? (
                                        <tr><td colSpan={2} className="py-24 text-center text-foreground/10 font-mono font-black uppercase tracking-[0.6em] text-sm italic">No student records found</td></tr>
                                    ) : (
                                        examStudents.map((student: any) => (
                                            <tr key={student.id} className="group hover:bg-primary/[0.03] transition-all duration-500">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-x-8">
                                                        <div className="h-14 w-14 flex items-center justify-center bg-primary/5 font-mono font-black text-xs text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 skew-x-[-12deg]">
                                                            <span className="not-skew-x">{student.id.slice(0, 3)}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-foreground uppercase tracking-tighter text-lg group-hover:text-primary transition-colors italic leading-none mb-2">
                                                                {student.profile?.first_name} {student.profile?.last_name}
                                                            </p>
                                                            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground/30">Roll No: {student.admission_number || student.id.slice(0, 12)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="relative inline-block skew-x-[-12deg]">
                                                        <Input
                                                            type="number"
                                                            placeholder="000"
                                                            className="w-40 h-16 bg-white/[0.03] border-primary/20 rounded-none font-black text-2xl italic text-right focus-visible:ring-primary/50 focus-visible:bg-primary/5 transition-all text-primary placeholder:text-primary/10"
                                                            value={marks[student.id] || ""}
                                                            onChange={(e) => setMarks({ ...marks, [student.id]: e.target.value })}
                                                        />
                                                        <div className="absolute -bottom-1 right-0 w-8 h-[2px] bg-primary group-hover:w-full transition-all duration-700" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-12 border-t border-primary/10 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-8 flex-shrink-0 relative">
                        <div className="absolute top-[-1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-foreground/30 italic">Total Students: {examStudents.length}</p>
                        </div>
                        <div className="flex items-center gap-x-10">
                            <button 
                                type="button" 
                                onClick={() => setIsMarksOpen(false)}
                                className="text-[11px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 hover:text-foreground transition-colors italic"
                            >
                                Discard Changes
                            </button>
                            <Button 
                                onClick={handleSaveMarks}
                                disabled={loading}
                                className="group relative h-16 px-14 bg-primary text-primary-foreground font-black rounded-none shadow-[0_0_50px_rgba(16,185,129,0.3)] uppercase tracking-[0.3em] text-[11px] skew-x-[-12deg] transition-all hover:scale-105 overflow-hidden border-none"
                            >
                                <span className="not-skew-x relative z-10 italic">
                                    {loading ? "Saving..." : "Save Marks"}
                                </span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

