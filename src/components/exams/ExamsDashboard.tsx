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

export function ExamsDashboard({ exams, classes, subjects, academicYears, students }: ExamsDashboardProps) {
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-sm bg-primary/10 text-primary border border-primary/20 mb-4">
                        <span className="h-1.5 w-1.5 rounded-sm bg-primary animate-pulse shadow-sm shadow-primary/50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Schedule</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Examination Hub</h2>
                    <p className="text-foreground/60 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">Exam Scheduling, Marks Entry & Results Management</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] px-8 py-6 h-auto emerald-glow shadow-2xl text-[11px] gap-x-2">
                            <Plus className="h-4 w-4" /> Create Exam
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border border-border max-w-lg rounded-sm p-0 overflow-hidden">
                        <div className="bg-card/40 p-6 border-b border-border">
                            <DialogTitle className="font-black text-2xl uppercase tracking-tight">Create Examination</DialogTitle>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Register new assessment node</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Exam Name</Label>
                                <Input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} placeholder="e.g. Mid-Term Physics" className="rounded-sm bg-background/50 border-border font-bold uppercase text-xs" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Subject</Label>
                                    <Select value={examForm.subject_id} onValueChange={(v) => setExamForm({ ...examForm, subject_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {subjects.map(s => <SelectItem key={s.id} value={s.id} className="font-bold uppercase text-[10px]">{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Sector (Class)</Label>
                                    <Select value={examForm.class_id} onValueChange={(v) => setExamForm({ ...examForm, class_id: v })}>
                                        <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold uppercase text-[10px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 border-border">
                                            {classes.map(c => <SelectItem key={c.id} value={c.id} className="font-bold uppercase text-[10px]">{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Date Node</Label>
                                    <Input type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} className="rounded-sm bg-background/50 border-border font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Max Load</Label>
                                    <Input type="number" value={examForm.max_marks} onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} className="rounded-sm bg-background/50 border-border font-black" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Pass Logic</Label>
                                    <Input type="number" value={examForm.passing_marks} onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} className="rounded-sm bg-background/50 border-border font-black text-primary" />
                                </div>
                            </div>
                            <Button onClick={handleCreateExam} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px] mt-2">
                                {loading ? "Initializing..." : "Commit Examination"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary relative z-10">Total Exams</p>
                    <h3 className="text-3xl font-black mt-2 text-foreground relative z-10">{exams.length}</h3>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 relative z-10">Upcoming</p>
                    <h3 className="text-3xl font-black text-blue-500 relative z-10">{upcoming.length}</h3>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-2 relative z-10">Completed</p>
                    <h3 className="text-3xl font-black text-green-500 relative z-10">{completed.length}</h3>
                </div>
                <div className="relative group overflow-hidden bg-card/40 backdrop-blur-xl border border-border p-6 rounded-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 relative z-10">Subjects Covered</p>
                    <h3 className="text-3xl font-black text-foreground relative z-10">{new Set(exams.map(e => e.subject_id)).size}</h3>
                </div>
            </div>

            {/* Marks Entry Dialog */}
            <Dialog open={isMarksOpen} onOpenChange={setIsMarksOpen}>
                <DialogContent className="bg-background border border-border max-w-2xl max-h-[85vh] overflow-hidden rounded-sm p-0 flex flex-col">
                    <div className="bg-card/40 p-6 border-b border-border">
                        <DialogTitle className="font-black text-2xl uppercase tracking-tight">Telemetry Input — {selectedExam?.name}</DialogTitle>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                            Max: {selectedExam?.max_marks} • Threshold: {selectedExam?.passing_marks}
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                        {examStudents.length === 0 ? (
                            <div className="py-20 text-center">
                                <Users className="h-10 w-10 mx-auto text-foreground/10 mb-4" />
                                <p className="text-foreground/40 font-black uppercase tracking-widest text-xs">No personnel records found for this class sector.</p>
                            </div>
                        ) : (
                            examStudents.map((s: any) => (
                                <div key={s.id} className="flex items-center gap-x-4 p-4 rounded-sm bg-foreground/5 border border-border/50 group hover:border-primary/30 transition-all">
                                    <div className="h-10 w-10 rounded-sm bg-card text-white flex items-center justify-center font-black text-xs shadow-lg">{s.profile?.first_name?.[0]}</div>
                                    <div className="flex-1">
                                        <span className="text-[11px] font-black uppercase tracking-tight text-foreground block">{s.profile?.first_name} {s.profile?.last_name}</span>
                                        <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">{s.admission_number || "NO-ID"}</span>
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            max={selectedExam?.max_marks}
                                            value={marks[s.id] || ""}
                                            onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                                            className="w-24 text-center rounded-sm bg-background border-border font-black text-primary text-sm h-10"
                                            placeholder="—"
                                        />
                                        <span className="text-[10px] font-black text-foreground/30 w-12 tracking-widest">/ {selectedExam?.max_marks}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-6 bg-card/20 border-t border-border">
                        <Button onClick={handleSaveMarks} disabled={loading} className="w-full rounded-sm py-7 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow shadow-xl text-[11px]">
                            {loading ? "Synchronizing Data Shards..." : "Commit Data Telemetry"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tabs for Calendar vs List */}
            <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-14 w-fit">
                    <TabsTrigger value="list" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow">
                        <FileText className="h-4 w-4" /> Registry View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-sm px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2">
                        <Calendar className="h-4 w-4" /> Chrono Map
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-2xl shadow-primary/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-foreground/5 border-b border-border">
                                    <tr>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Examination Node</th>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Subject</th>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Class Sector</th>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Date Node</th>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Load / Threshold</th>
                                        <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Status</th>
                                        <th className="text-right py-5 px-6 font-black uppercase tracking-widest text-[10px] text-primary/60">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {exams.length === 0 ? (
                                        <tr><td colSpan={7} className="py-20 text-center text-foreground/30 font-black uppercase tracking-widest text-xs">No examination nodes initialized.</td></tr>
                                    ) : (
                                        exams.map((exam) => {
                                            const isUpcoming = new Date(exam.date) >= new Date();
                                            return (
                                                <tr key={exam.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-x-4">
                                                            <div className={cn("h-11 w-11 rounded-sm text-white flex items-center justify-center font-black shadow-lg", isUpcoming ? "bg-primary emerald-glow" : "bg-card")}>
                                                                <ClipboardCheck className="h-5 w-5" />
                                                            </div>
                                                            <span className="font-black text-foreground tracking-tight uppercase text-xs">{exam.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{exam.subject?.name || "N/A"}</span>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{exam.class?.name || "N/A"}</span>
                                                    </td>
                                                    <td className="py-5 px-6 font-black text-[10px] tracking-widest text-foreground/40">{exam.date}</td>
                                                    <td className="py-5 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground text-xs">{exam.max_marks}</span>
                                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Pass: {exam.passing_marks}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <div className={cn(
                                                            "inline-flex items-center px-3 py-1 rounded-sm font-black text-[9px] uppercase tracking-widest",
                                                            isUpcoming ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-primary/10 text-primary border border-primary/20"
                                                        )}>
                                                            {isUpcoming ? "UPCOMING" : "COMPLETED"}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleOpenMarks(exam)} className="rounded-sm font-black text-[9px] uppercase tracking-widest h-9 border-primary/20 text-primary hover:bg-primary/10 px-4">
                                                                <Pencil className="h-3 w-3 mr-1" /> MARKS
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => handleDeleteExam(exam.id)} className="rounded-sm font-black text-[9px] uppercase tracking-widest h-9 border-red-500/20 text-red-500 hover:bg-red-500/10 px-3">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-sm p-6 min-h-[600px] shadow-2xl glass-dark">
                        <BigCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            views={["month", "week", "day", "agenda"]}
                            view={calendarView}
                            onView={(v) => setCalendarView(v)}
                            popup
                            selectable
                            onSelectEvent={(event) => handleOpenMarks(event.resource)}
                            eventPropGetter={(event: any) => {
                                const isUpcoming = new Date(event.resource.date) >= new Date();
                                return {
                                    className: cn(
                                        "rounded-sm border font-black text-[9px] uppercase tracking-widest shadow-xl",
                                        isUpcoming
                                            ? "bg-blue-500 text-white border-blue-600"
                                            : "bg-primary text-white border-primary"
                                    )
                                };
                            }}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

