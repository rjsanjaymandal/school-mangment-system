"use client";

import { useState, useMemo } from "react";
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
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Search, Filter, Hash, CheckCircle2, Clock } from "lucide-react";

interface ExamsDashboardProps {
    exams: any[];
    classes: any[];
    subjects: any[];
    academicYears: any[];
    students: any[];
    marksSummary?: any[];
    userRole: string;
}

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

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

export function ExamsDashboard({ 
    exams, 
    classes, 
    subjects, 
    academicYears, 
    students, 
    marksSummary = [], 
    userRole 
}: ExamsDashboardProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isMarksOpen, setIsMarksOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [existingMarks, setExistingMarks] = useState<any[]>([]);
    const [calendarView, setCalendarView] = useState<View>("month");

    // --- Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterClass, setFilterClass] = useState("all");
    const [filterSubject, setFilterSubject] = useState("all");

    // --- Analytics Logic ---
    const passFailData = useMemo(() => {
        if (!marksSummary || marksSummary.length === 0) return [];
        let pass = 0;
        let fail = 0;
        marksSummary.forEach(m => {
            const passMarks = m.exam?.passing_marks || 35;
            if (m.marks_obtained >= passMarks) pass++;
            else fail++;
        });
        return [
            { name: "Pass", value: pass, color: "#10b981" },
            { name: "Fail", value: fail, color: "#ef4444" }
        ];
    }, [marksSummary]);

    const subjectPerformance = useMemo(() => {
        if (!marksSummary || marksSummary.length === 0) return [];
        const subMap: Record<string, { total: number, count: number }> = {};
        marksSummary.forEach(m => {
            const subName = m.exam?.subject?.name || "Unknown";
            if (!subMap[subName]) subMap[subName] = { total: 0, count: 0 };
            subMap[subName].total += m.marks_obtained;
            subMap[subName].count++;
        });
        return Object.entries(subMap).map(([name, data]) => ({
            name,
            avg: Math.round(data.total / data.count)
        })).sort((a, b) => b.avg - a.avg).slice(0, 5);
    }, [marksSummary]);

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

    const filteredExams = exams.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              e.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === "all" || e.class_id === filterClass;
        const matchesSubject = filterSubject === "all" || e.subject_id === filterSubject;
        return matchesSearch && matchesClass && matchesSubject;
    });

    const calendarEvents = filteredExams.map(e => {
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exam Management</h1>
                        <p className="text-sm text-muted-foreground mt-2">Manage school examinations</p>
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
                <TabsList className="bg-muted p-1 rounded-lg h-10 mb-8 flex items-center w-fit">
                    <TabsTrigger value="list" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <div className="flex items-center gap-x-2">
                            <ClipboardCheck className="h-4 w-4" />
                            <span>Exam List</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <div className="flex items-center gap-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Exam Calendar</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0 space-y-12">
                    {/* --- Analytics Layer: Institutional Intelligence --- */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-2">
                        <div className="md:col-span-8 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                                <BarChart3 className="h-48 w-48 text-primary" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                                        Performance Overview
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Subject-wise average performance
                                    </p>
                                </div>
                                <div className="flex-1 h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={subjectPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: "#88888860", fontSize: 10, fontWeight: "bold" }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#88888840", fontSize: 10 }} />
                                            <Tooltip 
                                                cursor={{ fill: "#ffffff05" }} 
                                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                            <div className="mb-8 relative z-10 text-center">
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    Pass/Fail Ratio
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2 text-center">Current exam series</p>
                            </div>
                            <div className="h-[280px] relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={passFailData}
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {passFailData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* --- Control Layer --- */}
                    <div className="bg-card p-3 rounded-lg border border-border flex flex-col md:flex-row items-center gap-4 shadow-sm">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search exams or subjects..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 w-full bg-background"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Select value={filterClass} onValueChange={setFilterClass}>
                                <SelectTrigger className="w-[180px] h-10">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Class" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={filterSubject} onValueChange={setFilterSubject}>
                                <SelectTrigger className="w-[180px] h-10">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Subject" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { label: "Total Exams", value: exams.length, icon: FileText, width: "78%" },
                            { label: "Active Participants", value: students.length, icon: Users, width: "92%" },
                            { label: "Subject Coverage", value: new Set(exams.map(e => e.subject_id)).size, icon: BookOpen, width: "64%" },
                            { label: "Evaluation Rate", value: `${Math.round((exams.filter(e => e.marks?.[0]?.count > 0).length / (exams.length || 1)) * 100)}%`, icon: Calendar, width: "100%" },
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
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Exam Name / Subject</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Marks / Passing</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredExams.map((exam) => (
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
                                             <div className="p-3 bg-muted rounded-lg border border-border inline-block min-w-[120px] text-center italic">
                                                {exam.class?.name}
                                             </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-x-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl font-black italic text-foreground tracking-tighter leading-none">{exam.max_marks}</span>
                                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-foreground/20">MAX_VAL</span>
                                                </div>
                                                <div className="h-8 w-px bg-primary/20" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-mono font-black uppercase tracking-widest text-primary italic leading-none">{exam.passing_marks}</span>
                                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary/30">PASS_LVL</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono font-bold text-[12px] uppercase tracking-wider text-foreground">
                                            {format(new Date(exam.date), "dd-MM-yyyy")}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {exam.marks?.[0]?.count > 0 ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15 py-1 px-4 rounded-full font-mono font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2 justify-center w-fit mx-auto">
                                                    <CheckCircle2 className="h-3 w-3" /> Evaluated
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-500/40 border-amber-500/10 py-1 px-4 rounded-full font-mono font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2 justify-center w-fit mx-auto">
                                                    <Clock className="h-3 w-3" /> Scheduled
                                                </Badge>
                                            )}
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
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm overflow-hidden">
                        <div className="h-[700px]">
                            <BigCalendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
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
                    <div className="p-6 bg-muted border-b border-border relative overflow-hidden">
                        <div className="relative z-10">
                            <DialogTitle asChild>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    Create Exam
                                </h3>
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Schedule a new examination
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <Label>Exam Name</Label>
                                <Input 
                                    placeholder="e.g. First Term Finals" 
                                    className="h-10 bg-background"
                                    value={examForm.name} 
                                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Date</Label>
                                <Input 
                                    type="date" 
                                    className="h-10 bg-background"
                                    value={examForm.date} 
                                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select onValueChange={(v) => setExamForm({ ...examForm, class_id: v })}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select onValueChange={(v) => setExamForm({ ...examForm, subject_id: v })}>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                            <div className="space-y-2">
                                <Label>Maximum Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-10 bg-background"
                                    value={examForm.max_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Passing Marks</Label>
                                <Input 
                                    type="number" 
                                    className="h-10 bg-background"
                                    value={examForm.passing_marks} 
                                    onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-x-4 pt-6">
                            <Button 
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateExam}
                                disabled={loading}
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
                    <div className="p-6 bg-muted border-b border-border relative overflow-hidden flex-shrink-0">
                        <div className="relative z-10">
                            <DialogTitle asChild>
                                <h3 className="text-xl font-bold tracking-tight text-foreground">
                                    Exam Results
                                </h3>
                            </DialogTitle>
                            <div className="flex flex-wrap items-center gap-6 mt-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" /> Exam: {selectedExam?.name}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 border-l border-border pl-6">
                                    <Award className="h-4 w-4 text-primary" /> Max Marks: {selectedExam?.max_marks} Points
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="border border-border rounded-lg mb-10 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Marks Obtained</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
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

                    {/* --- Progress Protocol Footer --- */}
                    <div className="p-6 border-t border-border bg-muted/50 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0 relative">
                        <div className="flex-1 w-full max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <p className="text-sm font-medium text-foreground">
                                        Evaluation Progress: <span className="font-bold text-primary">{Object.values(marks).filter(v => v !== "").length}</span> / {examStudents.length}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {Math.round((Object.values(marks).filter(v => v !== "").length / (examStudents.length || 1)) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-700 ease-out"
                                    style={{ width: `${(Object.values(marks).filter(v => v !== "").length / (examStudents.length || 1)) * 100}%` }}
                                />
                            </div>
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

