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
                    <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-lg group hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                        <Award className="h-8 w-8 transition-all duration-300" />
                    </div>
                    <div>
                        <div className="relative">
                            <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground leading-none">Exam <span className="text-primary italic">Management</span></h1>
                        </div>
                        <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/40 mt-3 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" /> Manage School Examinations
                        </p>
                    </div>
                </div>

                {(userRole === "admin" || userRole === "teacher") && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm hover:scale-105 transition-all"
                    >
                        <span className="flex items-center gap-x-2 uppercase tracking-wider text-[10px]">
                            Create Exam
                            <Plus className="h-4 w-4" />
                        </span>
                    </Button>
                )}
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="bg-muted/50 border border-border p-1 rounded-lg h-auto mb-8 flex items-center gap-2">
                    <TabsTrigger value="list" className="rounded-md px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[11px] uppercase tracking-wide transition-all italic">
                        <span className="flex items-center gap-x-2">
                            <ClipboardCheck className="h-4 w-4" /> Exam List
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-md px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-[11px] uppercase tracking-wide transition-all italic text-foreground/40">
                        <span className="flex items-center gap-x-2">
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
                            <div key={i} className="bg-card p-6 border border-border rounded-xl shadow-sm hover:border-primary/50 transition-all group">
                                <div className="relative z-10">
                                    <stat.icon className="absolute right-[-10px] bottom-[-10px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all" />
                                    <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary/60 mb-4 italic">{stat.label}</p>
                                    <h3 className="text-4xl font-bold italic tracking-tight text-foreground group-hover:text-primary transition-all leading-none">
                                        {stat.value}
                                    </h3>
                                    <div className="h-1 w-full bg-muted mt-6 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                                            style={{ width: stat.width }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Exam Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Class</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Total Marks</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 font-medium tracking-tight">
                                {exams.map((exam) => (
                                    <tr key={exam.id} className="group hover:bg-primary/[0.02] transition-all duration-500">
                                        <td className="px-6 py-6">
                                            <div>
                                                <p className="font-bold text-foreground uppercase tracking-tight text-lg group-hover:text-primary transition-colors leading-none mb-2">
                                                    {exam.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <BookOpen className="h-3 w-3" />
                                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest">{exam.subject?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                             {exam.class?.name}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-mono font-bold text-[12px] uppercase tracking-wider text-foreground">
                                                    {format(new Date(exam.date), "dd-MM-yyyy")}
                                                </p>
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
                                                        size="sm"
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px]"
                                                    >
                                                        <span className="flex items-center gap-x-2">
                                                            <Plus className="h-3 w-3" /> Enter Results
                                                        </span>
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {(userRole === "admin" || userRole === "teacher") && (
                                                    <Button 
                                                        onClick={() => handleDeleteExam(exam.id)}
                                                        variant="ghost" 
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                <DialogContent className="bg-card border border-border p-0 overflow-hidden max-w-2xl rounded-xl shadow-2xl">
                    <div className="p-8 bg-muted/50 border-b border-border relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold uppercase tracking-tight text-foreground leading-none">
                                Exam <span className="text-primary italic">Details</span>
                            </h3>
                            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/40 mt-3 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary" /> Create a new exam
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Maximum Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-12 bg-background border-border rounded-lg font-bold text-lg"
                                    value={examForm.max_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Passing Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-12 bg-background border-border rounded-lg font-bold text-lg text-primary"
                                    value={examForm.passing_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-x-6 pt-8 border-t border-border">
                            <Button 
                                variant="ghost"
                                onClick={() => setIsCreateOpen(false)}
                                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateExam}
                                disabled={loading}
                                className="h-12 px-10 bg-primary text-primary-foreground font-bold rounded-lg shadow-md uppercase tracking-wider text-[11px] hover:scale-105 transition-all"
                            >
                                {loading ? "Saving..." : "Save Exam"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Marks Assessment Dialog */}
            <Dialog open={isMarksOpen} onOpenChange={setIsMarksOpen}>
                <DialogContent className="bg-card border border-border p-0 overflow-hidden max-w-5xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl">
                    <div className="p-8 bg-muted/50 border-b border-border relative overflow-hidden flex-shrink-0">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold uppercase tracking-tight text-foreground leading-none">
                                Exam <span className="text-primary italic">Results</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/40 italic flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" /> Exam: {selectedExam?.name}
                                </p>
                                <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-foreground/40 italic flex items-center gap-2 border-l border-border pl-6">
                                    <span className="h-1 w-1 rounded-full bg-primary/50" /> Max Marks: {selectedExam?.max_marks} Points
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                                        <tr><td colSpan={2} className="py-16 text-center text-muted-foreground/30 font-bold uppercase tracking-widest text-xs italic">No student records found</td></tr>
                                    ) : (
                                        examStudents.map((student: any) => (
                                            <tr key={student.id} className="group hover:bg-muted/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-x-6">
                                                        <div className="h-10 w-10 flex items-center justify-center bg-muted font-mono font-bold text-[10px] text-muted-foreground border border-border rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                            {student.id.slice(0, 3)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground uppercase tracking-tight text-md group-hover:text-primary transition-colors leading-none mb-1">
                                                                {student.profile?.first_name} {student.profile?.last_name}
                                                            </p>
                                                            <p className="text-[9px] font-mono font-medium uppercase tracking-wider text-muted-foreground/60">Roll No: {student.admission_number || student.id.slice(0, 12)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="relative inline-block">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="w-32 h-12 bg-muted/50 border-border rounded-lg font-bold text-xl text-right text-primary placeholder:text-primary/10"
                                                            value={marks[student.id] || ""}
                                                            onChange={(e) => setMarks({ ...marks, [student.id]: e.target.value })}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-8 border-t border-border bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0 relative">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Total Students: {examStudents.length}</p>
                        </div>
                        <div className="flex items-center gap-x-6">
                            <Button 
                                variant="ghost"
                                onClick={() => setIsMarksOpen(false)}
                                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                                Discard
                            </Button>
                            <Button 
                                onClick={handleSaveMarks}
                                disabled={loading}
                                className="h-12 px-10 bg-primary text-primary-foreground font-bold rounded-lg shadow-md uppercase tracking-wider text-[11px] hover:scale-105 transition-all"
                            >
                                {loading ? "Saving..." : "Save Marks"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

