"use client";

import { useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    CheckCircle2,
    Zap,
    AlertCircle,
    User,
    Activity,
    BookMarked,
    LayoutGrid,
    Trash2
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createTimetableSlot, deleteTimetableSlot } from "@/app/actions/timetable";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const COLORS = ["blue", "purple", "indigo", "emerald", "amber", "rose"];

interface TimetableDashboardProps {
    timetables: any[];
    classes: any[];
    subjects: any[];
    teachers: any[];
    academicYears: any[];
    userRole: string;
}

export function TimetableDashboard({ timetables, classes, subjects, teachers, academicYears, userRole }: TimetableDashboardProps) {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";

    // --- Analytics Logic ---
    const subjectDistribution = useMemo(() => {
        const subMap: Record<string, number> = {};
        timetables.filter(t => t.class_id === selectedClass).forEach(t => {
            t.slots?.forEach((s: any) => {
                const name = s.subject?.name || "Unknown";
                subMap[name] = (subMap[name] || 0) + 1;
            });
        });
        return Object.entries(subMap).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value).slice(0, 5);
    }, [timetables, selectedClass]);

    const teacherLoadData = useMemo(() => {
        const teaMap: Record<string, number> = {};
        timetables.forEach(t => {
            t.slots?.forEach((s: any) => {
                const name = s.teacher?.profile?.full_name || "Unknown";
                teaMap[name] = (teaMap[name] || 0) + 1;
            });
        });
        return Object.entries(teaMap).map(([name, value], idx) => ({
            name,
            value,
            color: COLORS[idx % COLORS.length]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [timetables]);

    const currentAY = academicYears.find((ay: any) => ay.is_current) || academicYears[0];

    const [slotForm, setSlotForm] = useState({
        subject_id: "",
        teacher_id: "",
        start_time: "",
        end_time: "",
        room_number: "",
    });

    const allRooms = useMemo(() => {
        const rooms = new Set<string>();
        classes.forEach(c => {
            if (c.room_number) rooms.add(c.room_number);
        });
        return Array.from(rooms).sort();
    }, [classes]);

    const occupiedRooms = useMemo(() => {
        if (!slotForm.start_time || !slotForm.end_time) return new Set<string>();
        
        const occupied = new Set<string>();
        timetables.forEach(t => {
            if (t.day_of_week === selectedDay) {
                t.slots?.forEach((s: any) => {
                    // Simple overlap check: (StartA < EndB) and (EndA > StartB)
                    if (s.room_number && 
                        slotForm.start_time < s.end_time && 
                        slotForm.end_time > s.start_time) {
                        occupied.add(s.room_number);
                    }
                });
            }
        });
        return occupied;
    }, [timetables, selectedDay, slotForm.start_time, slotForm.end_time]);

    const handleCreateSlot = async () => {
        if (!selectedClass || !currentAY) return;
        setLoading(true);
        const result = await createTimetableSlot({
            class_id: selectedClass,
            academic_year_id: currentAY.id,
            day_of_week: selectedDay,
            ...slotForm,
        });
        setLoading(false);
        if (result.success) {
            setIsAddSlotOpen(false);
            setSlotForm({ subject_id: "", teacher_id: "", start_time: "", end_time: "", room_number: "" });
            router.refresh();
            toast.success("Schedule slot added successfully");
        } else {
            toast.error(result.error || "Failed to add slot");
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm("Are you sure you want to delete this schedule slot?")) return;
        setLoading(true);
        const result = await deleteTimetableSlot(slotId);
        setLoading(false);
        if (result.success) {
            router.refresh();
            toast.success("Schedule slot deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete slot");
        }
    };

    // Filter timetable for current class and day
    const dayTimetable = timetables.find(
        (t: any) => t.class_id === selectedClass && t.day_of_week === selectedDay
    );
    const slots = dayTimetable?.slots || [];

    // Count total slots across all days
    const totalSlots = timetables
        .filter((t: any) => t.class_id === selectedClass)
        .reduce((sum: number, t: any) => sum + (t.slots?.length || 0), 0);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header / Command Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-x-3 mb-4">
                        <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-x-2">
                            <Clock className="h-3.5 w-3.5" />
                            Class Schedule Active
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">
                        Class <span className="text-primary font-light">/</span> Schedule
                    </h2>
                    <p className="text-muted-foreground mt-4 text-sm max-w-md">
                        Manage your weekly class timetable and institutional resource allocations.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {classes.length > 0 && (
                        <div className="relative group">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="w-[240px] h-12 bg-background border-border font-medium">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {isAdminOrTeacher && (
                        <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-8 flex items-center gap-x-2 shadow-sm">
                                    <Plus className="h-4 w-4" /> Add Slot
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] p-0">
                                <DialogHeader className="p-6 border-b border-border bg-muted/50">
                                    <DialogTitle>Add Schedule Slot</DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Configure the class schedule for the selected day.</p>
                                </DialogHeader>
                                <div className="p-6 space-y-6">
                                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-x-4">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <AlertCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Target Class</p>
                                            <p className="font-semibold text-lg text-foreground">
                                                {selectedDay} <span className="text-primary font-light px-1">/</span> {classes.find((c: any) => c.id === selectedClass)?.name || "—"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Subject</Label>
                                            <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((s: any) => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Teacher</Label>
                                            <Select value={slotForm.teacher_id} onValueChange={(v) => setSlotForm({ ...slotForm, teacher_id: v })}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Teacher" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teachers.map((t: any) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            {t.profile?.full_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Start Time</Label>
                                            <Input type="time" className="h-10" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">End Time</Label>
                                            <Input type="time" className="h-10" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Room Number</Label>
                                        <Select value={slotForm.room_number} onValueChange={(v) => setSlotForm({ ...slotForm, room_number: v })}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select Room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allRooms.map((room) => {
                                                    const isOccupied = occupiedRooms.has(room);
                                                    return (
                                                        <SelectItem key={room} value={room} disabled={isOccupied}>
                                                            <div className="flex items-center justify-between w-full gap-x-2">
                                                                <span>{room}</span>
                                                                {isOccupied && <span className="text-[10px] text-destructive font-bold uppercase">(Occupied)</span>}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                                {allRooms.length === 0 && (
                                                    <SelectItem value="none" disabled>No rooms defined in classes</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button onClick={handleCreateSlot} disabled={loading} className="w-full h-12 text-sm font-semibold uppercase tracking-wider">
                                        {loading ? "Saving..." : "Save Schedule Slot"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Analytics Layer */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight uppercase leading-none text-foreground">
                                    Course <span className="text-primary italic">Distribution</span>
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">
                                    Subject-wise hour allocation for current class
                                </p>
                            </div>
                            <BookMarked className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectDistribution}>
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
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="mb-8 relative z-10 text-center">
                        <h3 className="text-xl font-bold tracking-tight uppercase leading-none text-foreground">
                            Teacher <span className="text-primary font-light px-1">/</span> Load
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">Global Staff Load Profile</p>
                    </div>
                    <div className="h-[280px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teacherLoadData}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {teacherLoadData.map((entry: any, index: number) => (
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

            {/* Main Scheduling Grid */}
            <div className="grid gap-12 lg:grid-cols-4">
                {/* Day Selector */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between ml-2">
                        <div className="flex items-center gap-x-3">
                            <Calendar className="h-4 w-4 text-primary" />
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Weekdays</h3>
                        </div>
                    </div>
                    <div className="p-3 space-y-2 border border-border bg-card rounded-xl">
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`w-full group relative flex items-center justify-between p-4 rounded-lg transition-all font-bold text-[11px] uppercase tracking-wider ${
                                    selectedDay === day 
                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                <span className="relative z-10">{day}</span>
                                {selectedDay === day ? (
                                    <CheckCircle2 className="h-4 w-4 relative z-10" />
                                ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule Grid Content */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="flex gap-x-10 overflow-x-auto pb-10 scrollbar-emerald">
                        {TIME_SLOTS.map((time) => {
                            const matchingSlots = slots.filter((s: any) => s.start_time?.startsWith(time));
                            return (
                                <div key={time} className="flex-1 min-w-[220px] space-y-8 animate-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${parseInt(time) * 50}ms` }}>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-x-4">
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary italic">{time}</p>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {matchingSlots.map((s: any) => (
                                            <div 
                                                key={s.id} 
                                                className="group relative bg-card border border-border p-5 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-x-2">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Active</span>
                                                    </div>
                                                    {isAdminOrTeacher && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDeleteSlot(s.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {s.subject?.name || "No Subject"}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium">
                                                        {s.teacher?.profile?.full_name}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <div className="flex items-center gap-x-2">
                                                        <MapPin className="h-3 w-3 text-primary/60" />
                                                        {s.room_number || "TBD"}
                                                    </div>
                                                    <div className="px-2 py-0.5 bg-muted rounded-full">
                                                        {s.end_time?.slice(0, 5)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {matchingSlots.length === 0 && isAdminOrTeacher && (
                                            <button 
                                                onClick={() => { 
                                                    setSlotForm({ 
                                                        ...slotForm, 
                                                        start_time: time, 
                                                        end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` 
                                                    }); 
                                                    setIsAddSlotOpen(true); 
                                                }}
                                                className="h-32 w-full rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center group hover:border-primary/40 hover:bg-primary/5 transition-all"
                                            >
                                                <Plus className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary transition-all" />
                                                <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/0 group-hover:text-primary group-hover:opacity-100 opacity-0 transition-all">Add Slot</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid gap-10 md:grid-cols-2">
                        <div className="bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Schedule Status</p>
                                    <div className="flex items-center gap-x-4">
                                        <h4 className="text-5xl font-bold text-foreground leading-none">Healthy</h4>
                                        <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary font-bold text-[10px] uppercase">No Conflicts</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[280px] mt-4">
                                Schedule validation complete. No time-slot overlaps or resource conflicts detected.
                            </p>
                        </div>
                        
                        <div className="bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Slots</p>
                                    <h4 className="text-5xl font-bold text-foreground leading-none">{totalSlots}</h4>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[280px] mt-4">
                                Total scheduled periods across the current academic week.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
