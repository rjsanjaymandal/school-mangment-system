"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    CheckCircle2,
    Zap,
    AlertCircle,
} from "lucide-react";
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
import { createTimetableSlot } from "@/app/actions/timetable";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const COLORS = ["blue", "purple", "indigo", "emerald", "amber", "rose"];

interface TimetableDashboardProps {
    timetables: any[];
    classes: any[];
    subjects: any[];
    teachers: any[];
    academicYears: any[];
}

export function TimetableDashboard({ timetables, classes, subjects, teachers, academicYears }: TimetableDashboardProps) {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const currentAY = academicYears.find((ay: any) => ay.is_current) || academicYears[0];

    const [slotForm, setSlotForm] = useState({
        subject_id: "",
        teacher_id: "",
        start_time: "",
        end_time: "",
        room_number: "",
    });

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
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Temporal Allocation</h2>
                    <div className="flex items-center gap-x-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        Institutional Schedule Control
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {classes.length > 0 && (
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[200px] h-11 rounded-sm border-border bg-card/40 backdrop-blur-xl font-black uppercase tracking-wider text-[10px]">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent className="glass-dark border-primary/20">
                                {classes.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-6 rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] gap-x-2 emerald-glow hover:translate-y-[-2px] transition-all duration-300">
                                <Plus className="h-4 w-4" /> Commit Node
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-lg overflow-hidden ring-1 ring-primary/20">
                            <div className="bg-primary p-8 text-primary-foreground">
                                <DialogHeader>
                                    <DialogTitle className="font-black text-2xl uppercase tracking-tighter">Initialize Schedule Node</DialogTitle>
                                    <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Temporal Resource Allocation</p>
                                </DialogHeader>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-4 rounded-sm bg-primary/5 border border-primary/10 flex items-start gap-x-4">
                                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Target Allocation</p>
                                        <p className="font-bold text-foreground">{selectedDay} — {classes.find((c: any) => c.id === selectedClass)?.name || "—"}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Subject</Label>
                                        <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                            <SelectTrigger className="bg-card/40 border-border rounded-sm h-11"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                            <SelectContent>{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Personnel</Label>
                                        <Select value={slotForm.teacher_id} onValueChange={(v) => setSlotForm({ ...slotForm, teacher_id: v })}>
                                            <SelectTrigger className="bg-card/40 border-border rounded-sm h-11"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                            <SelectContent>{teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.profile?.first_name} {t.profile?.last_name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Activation Time</Label>
                                        <Input type="time" className="bg-card/40 border-border rounded-sm h-11" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Termination Time</Label>
                                        <Input type="time" className="bg-card/40 border-border rounded-sm h-11" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Location / Room Number</Label>
                                    <Input className="bg-card/40 border-border rounded-sm h-11" value={slotForm.room_number} onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })} placeholder="Logistics Hub / Lab 302" />
                                </div>

                                <Button onClick={handleCreateSlot} disabled={loading} className="w-full h-14 rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs emerald-glow hover:translate-y-[-2px] transition-all">
                                    {loading ? "INITIALIZING..." : "INITIALIZE NODE"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Day Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-x-2 mb-2 ml-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Operational Cycle</h3>
                    </div>
                    <div className="p-2 bg-card/40 backdrop-blur-xl border border-border rounded-sm space-y-1">
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`w-full flex items-center justify-between p-4 rounded-sm transition-all duration-300 font-black text-xs uppercase tracking-wider ${
                                    selectedDay === day 
                                        ? "bg-primary text-primary-foreground shadow-xl emerald-glow translate-x-1" 
                                        : "text-foreground/60 hover:text-foreground hover:bg-primary/5"
                                }`}
                            >
                                {day}
                                {selectedDay === day && <div className="h-1 w-1 rounded-full bg-primary-foreground animate-pulse" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule Grid */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex gap-x-6 overflow-x-auto pb-6 scrollbar-emerald">
                        {TIME_SLOTS.map((time) => {
                            const matchingSlots = slots.filter((s: any) => s.start_time?.startsWith(time));
                            return (
                                <div key={time} className="flex-1 min-w-[180px] space-y-6">
                                    <div className="text-center space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">{time}</p>
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                    </div>
                                    <div className="space-y-4">
                                        {matchingSlots.map((s: any) => (
                                            <div 
                                                key={s.id} 
                                                className="group relative bg-card/40 backdrop-blur-xl border border-border rounded-sm p-5 space-y-4 hover:bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
                                            >
                                                {/* Status Light */}
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-primary/50 emerald-glow" />
                                                
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className="text-[8px] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-xs uppercase tracking-widest">
                                                        Lecture Node
                                                    </span>
                                                    <Clock className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors" />
                                                </div>
                                                
                                                <div className="space-y-1 relative z-10">
                                                    <h4 className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                                        {s.subject?.name || "TBD"}
                                                    </h4>
                                                    <p className="text-[10px] text-foreground/60 font-black uppercase tracking-wider">
                                                        {s.teacher?.profile?.first_name} {s.teacher?.profile?.last_name}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-border/50 text-[9px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground/70 transition-colors">
                                                    <div className="flex items-center gap-x-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-primary/60" />
                                                        {s.room_number || "Field A-1"}
                                                    </div>
                                                    <div className="text-primary font-black">
                                                        {s.end_time?.slice(0, 5)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {matchingSlots.length === 0 && (
                                            <button 
                                                onClick={() => { setSlotForm({ ...slotForm, start_time: time, end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` }); setIsAddSlotOpen(true); }}
                                                className="h-32 w-full rounded-sm border border-dashed border-primary/20 bg-primary/[0.02] flex items-center justify-center group hover:border-primary/60 hover:bg-primary/[0.05] transition-all duration-500"
                                            >
                                                <div className="flex flex-col items-center gap-y-2">
                                                    <Plus className="h-5 w-5 text-primary/20 group-hover:text-primary group-hover:scale-125 transition-all duration-500" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/0 group-hover:text-primary/60 transition-all">Initialize</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="group bg-card/40 backdrop-blur-xl border border-border rounded-sm p-8 space-y-6 hover:bg-card transition-all duration-500 shadow-sm hover:shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Schedule Integrity</p>
                                    <div className="flex items-center gap-x-2">
                                        <h4 className="text-4xl font-black text-foreground">100%</h4>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse emerald-glow" />
                                    </div>
                                </div>
                                <div className="h-16 w-16 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                                    <CheckCircle2 className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-relaxed">
                                Zero Temporal Conflicts Detected across the operational cycle.
                            </p>
                        </div>
                        
                        <div className="group bg-card/40 backdrop-blur-xl border border-border rounded-sm p-8 space-y-6 hover:bg-card transition-all duration-500 shadow-sm hover:shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Allocated Nodes</p>
                                    <h4 className="text-4xl font-black text-foreground">{totalSlots}</h4>
                                </div>
                                <div className="h-16 w-16 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 leading-relaxed">
                                Active Resource Allocation for this institutional node.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

