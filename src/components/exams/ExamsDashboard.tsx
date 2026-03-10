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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Examination Hub</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Exam Scheduling, Marks Entry & Results Management</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue"><Plus className="h-4 w-4" /> Create Exam</Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-none max-w-lg">
                        <DialogHeader><DialogTitle className="font-black text-2xl">Create Examination</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Exam Name</Label>
                                <Input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} placeholder="Mid-Term Physics" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Subject</Label>
                                    <Select value={examForm.subject_id} onValueChange={(v) => setExamForm({ ...examForm, subject_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Class</Label>
                                    <Select value={examForm.class_id} onValueChange={(v) => setExamForm({ ...examForm, class_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Date</Label>
                                    <Input type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Max Marks</Label>
                                    <Input type="number" value={examForm.max_marks} onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Passing</Label>
                                    <Input type="number" value={examForm.passing_marks} onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleCreateExam} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                {loading ? "Creating..." : "Create Exam"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Total Exams</p>
                    <h3 className="text-3xl font-black">{exams.length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Upcoming</p>
                    <h3 className="text-3xl font-black text-blue-600">{upcoming.length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Completed</p>
                    <h3 className="text-3xl font-black text-green-600">{completed.length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subjects Covered</p>
                    <h3 className="text-3xl font-black text-slate-900">{new Set(exams.map(e => e.subject_id)).size}</h3>
                </Card>
            </div>

            {/* Marks Entry Dialog */}
            <Dialog open={isMarksOpen} onOpenChange={setIsMarksOpen}>
                <DialogContent className="glass border-none max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-black text-2xl">Enter Marks — {selectedExam?.name}</DialogTitle></DialogHeader>
                    <p className="text-xs text-slate-400 font-bold">Max: {selectedExam?.max_marks} • Pass: {selectedExam?.passing_marks}</p>
                    <div className="space-y-3 pt-4">
                        {examStudents.length === 0 ? (
                            <p className="text-center text-slate-400 font-medium py-8">No students found for this class.</p>
                        ) : (
                            examStudents.map((s: any) => (
                                <div key={s.id} className="flex items-center gap-x-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{s.profile?.first_name?.[0]}</div>
                                    <span className="flex-1 text-sm font-bold text-slate-700">{s.profile?.first_name} {s.profile?.last_name}</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        max={selectedExam?.max_marks}
                                        value={marks[s.id] || ""}
                                        onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                                        className="w-24 text-center rounded-lg font-bold"
                                        placeholder="—"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 w-8">/ {selectedExam?.max_marks}</span>
                                </div>
                            ))
                        )}
                        <Button onClick={handleSaveMarks} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold mt-4">
                            {loading ? "Saving..." : "Save All Marks"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tabs for Calendar vs List */}
            <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl">
                    <TabsTrigger value="list" className="rounded-xl px-6 font-bold flex items-center gap-x-2">
                        <FileText className="h-4 w-4" /> List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-xl px-6 font-bold flex items-center gap-x-2">
                        <Calendar className="h-4 w-4" /> Calendar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Exam</th>
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Subject</th>
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Class</th>
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Date</th>
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Max / Pass</th>
                                    <th className="text-left py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                    <th className="text-right py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {exams.length === 0 ? (
                                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-medium">No exams created yet.</td></tr>
                                ) : (
                                    exams.map((exam) => {
                                        const isUpcoming = new Date(exam.date) >= new Date();
                                        return (
                                            <tr key={exam.id} className="hover:bg-white/60 transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-x-3">
                                                        <div className={cn("h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold", isUpcoming ? "bg-blue-500 neon-blue" : "bg-slate-900")}>
                                                            <ClipboardCheck className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-bold text-slate-900">{exam.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-slate-600 font-medium">{exam.subject?.name || "—"}</td>
                                                <td className="py-5 px-6 text-slate-600 font-medium">{exam.class?.name || "—"}</td>
                                                <td className="py-5 px-6 font-mono text-xs text-slate-500">{exam.date}</td>
                                                <td className="py-5 px-6 font-bold text-slate-700">{exam.max_marks} / {exam.passing_marks}</td>
                                                <td className="py-5 px-6">
                                                    <Badge variant="outline" className={cn("font-bold text-[10px]", isUpcoming ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-green-50 text-green-600 border-green-100")}>
                                                        {isUpcoming ? "UPCOMING" : "COMPLETED"}
                                                    </Badge>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-x-1">
                                                        <Button size="sm" variant="ghost" onClick={() => handleOpenMarks(exam)} className="rounded-xl font-bold text-xs text-blue-500 hover:bg-blue-50 gap-x-1">
                                                            <Pencil className="h-3 w-3" /> MARKS
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteExam(exam.id)} className="rounded-xl font-bold text-xs text-red-400 hover:bg-red-50 gap-x-1">
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
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <Card className="border-none glass futuristic-card p-6 min-h-[600px]">
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
                                        "rounded-lg border font-bold text-xs shadow-sm",
                                        isUpcoming
                                            ? "bg-blue-500 text-white border-blue-600"
                                            : "bg-green-500 text-white border-green-600"
                                    )
                                };
                            }}
                        />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
