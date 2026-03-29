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
    userRole: string;
}

export function TimetableDashboard({ timetables, classes, subjects, teachers, academicYears, userRole }: TimetableDashboardProps) {
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
        <div className="space-y-12 animate-in fade-in transition-all duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-0">
            <div>
                <div className="flex items-center gap-x-3 mb-4">
                    <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                        <Clock className="h-3 w-3 animate-pulse" />
                        Temporal Registry Active
                    </div>
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                    Temporal <span className="text-primary tracking-normal not-italic">/</span> Allocation
                </h2>
                <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
                    <MapPin className="h-3 w-3 text-primary" />
                    Institutional Resource Distribution Engine
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                {classes.length > 0 && (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all" />
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[240px] h-14 rounded-sm border-white/10 bg-white/5 backdrop-blur-2xl font-black uppercase tracking-widest text-[11px] relative z-10 hover:border-primary/40 transition-all">
                                <SelectValue placeholder="Select Sector" />
                            </SelectTrigger>
                            <SelectContent className="glass-dark border-primary/20 p-2">
                                {classes.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id} className="font-black uppercase text-[10px] tracking-widest p-3 hover:bg-primary/10 rounded-xs transition-colors cursor-pointer">
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {(userRole === "admin" || userRole === "teacher") && (
                    <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                        <DialogTrigger asChild>
                            <button className="relative group px-8 h-14 bg-primary text-primary-foreground rounded-sm overflow-hidden emerald-border-glow transition-all duration-500 hover:scale-105 active:scale-95">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                                <div className="flex items-center gap-x-3 relative z-10 font-black text-xs uppercase tracking-[0.3em]">
                                    <Plus className="h-4 w-4" /> Initialize Node
                                </div>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-white/10 bg-background/40 backdrop-blur-3xl max-w-xl overflow-hidden shadow-2xl rounded-sm ring-1 ring-white/10">
                            <div className="bg-primary/20 p-10 border-b border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-45 transition-all duration-1000">
                                    <Zap className="h-32 w-32 text-primary" />
                                </div>
                                <DialogHeader className="relative z-10">
                                    <DialogTitle className="font-black text-3xl uppercase tracking-tighter italic">Temporal Command</DialogTitle>
                                    <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic">Phase Initialization Interface</p>
                                </DialogHeader>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="p-6 rounded-sm bg-primary/5 border border-primary/10 flex items-start gap-x-6 relative group overflow-hidden">
                                     <div className="absolute inset-0 bg-primary text-primary-foreground opacity-0 group-hover:opacity-5 transition-opacity" />
                                    <div className="p-3 bg-primary/10 rounded-sm">
                                        <AlertCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Target Sector / Cycle</p>
                                        <p className="font-black text-xl text-foreground uppercase italic leading-none">
                                            {selectedDay} <span className="text-primary tracking-normal not-italic px-2">/</span> {classes.find((c: any) => c.id === selectedClass)?.name || "—"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 ml-1">Curriculum Node</Label>
                                        <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-sm h-14 font-black uppercase text-[10px] tracking-widest hover:border-primary/40 transition-all">
                                                <SelectValue placeholder="Select Subject" />
                                            </SelectTrigger>
                                            <SelectContent className="glass-dark border-primary/20">
                                                {subjects.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id} className="font-black uppercase text-[9px] tracking-widest">{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 ml-1">Personnel ID</Label>
                                        <Select value={slotForm.teacher_id} onValueChange={(v) => setSlotForm({ ...slotForm, teacher_id: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-sm h-14 font-black uppercase text-[10px] tracking-widest hover:border-primary/40 transition-all">
                                                <SelectValue placeholder="Select Staff" />
                                            </SelectTrigger>
                                            <SelectContent className="glass-dark border-primary/20">
                                                {teachers.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id} className="font-black uppercase text-[9px] tracking-widest">
                                                        {t.profile?.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 ml-1">Activation</Label>
                                        <Input type="time" className="bg-white/5 border-white/10 rounded-sm h-14 font-black text-foreground hover:border-primary/40 transition-all px-4" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 ml-1">Termination</Label>
                                        <Input type="time" className="bg-white/5 border-white/10 rounded-sm h-14 font-black text-foreground hover:border-primary/40 transition-all px-4" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 ml-1">Geospatial Coordinator</Label>
                                    <Input className="bg-white/5 border-white/10 rounded-sm h-14 font-black uppercase text-[10px] tracking-[0.2em] px-4 placeholder:text-foreground/20 hover:border-primary/40 transition-all" value={slotForm.room_number} onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })} placeholder="Logistics Hub / Lab 302" />
                                </div>

                                <button onClick={handleCreateSlot} disabled={loading} className="w-full relative group h-16 bg-primary text-primary-foreground rounded-sm overflow-hidden emerald-border-glow transition-all duration-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                                    <span className="relative z-10 font-black text-[13px] uppercase tracking-[0.5em] italic">
                                        {loading ? "Initializing..." : "Commit Temporal Node"}
                                    </span>
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-4">
            {/* Day Selector */}
            <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between ml-2">
                    <div className="flex items-center gap-x-3">
                        <Calendar className="h-4 w-4 text-primary animate-pulse" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/40">Cycle Phases</h3>
                    </div>
                </div>
                <div className="glass-card p-3 space-y-2 border-white/10">
                    {WEEKDAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`w-full group relative flex items-center justify-between p-5 rounded-sm transition-all duration-700 font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden ${
                                selectedDay === day 
                                    ? "bg-primary text-primary-foreground shadow-[0_0_30px_oklch(var(--primary)/0.3)] translate-x-3 italic" 
                                    : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                            }`}
                        >
                            <div className={`absolute inset-0 bg-white/10 transition-transform duration-700 ${selectedDay === day ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0"}`} />
                            <span className="relative z-10">{day}</span>
                            {selectedDay === day ? (
                                <Zap className="h-4 w-4 relative z-10 animate-bounce" />
                            ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-foreground/10 group-hover:bg-primary transition-colors" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="lg:col-span-3 space-y-12">
                <div className="flex gap-x-10 overflow-x-auto pb-10 scrollbar-emerald">
                    {TIME_SLOTS.map((time) => {
                        const matchingSlots = slots.filter((s: any) => s.start_time?.startsWith(time));
                        return (
                            <div key={time} className="flex-1 min-w-[220px] space-y-8 animate-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${parseInt(time) * 50}ms` }}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary italic">{time}</p>
                                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {matchingSlots.map((s: any) => (
                                        <div 
                                            key={s.id} 
                                            className="group relative glass-card p-6 space-y-6 transition-all duration-700 hover:emerald-border-glow hover:-translate-y-2 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-x-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Node active</span>
                                                </div>
                                                <div className="p-1.5 bg-white/5 rounded-xs border border-white/10 group-hover:border-primary/40 transition-colors">
                                                    <Clock className="h-3 w-3 text-foreground/40 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 relative z-10">
                                                <h4 className="font-black text-foreground text-lg uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">
                                                    {s.subject?.name || "Neural TBD"}
                                                </h4>
                                                <div className="flex items-center gap-x-2">
                                                    <div className="h-4 w-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                        <span className="text-[6px] font-black">AI</span>
                                                    </div>
                                                    <p className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em]">
                                                        {s.teacher?.profile?.full_name}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/60 transition-colors relative z-10">
                                                <div className="flex items-center gap-x-2">
                                                    <MapPin className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-all" />
                                                    {s.room_number || "Field-X"}
                                                </div>
                                                <div className="px-2 py-1 bg-white/5 rounded-xs border border-white/10 group-hover:text-primary group-hover:border-primary/20">
                                                    {s.end_time?.slice(0, 5)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {matchingSlots.length === 0 && (userRole === "admin" || userRole === "teacher") && (
                                        <button 
                                            onClick={() => { 
                                                setSlotForm({ 
                                                    ...slotForm, 
                                                    start_time: time, 
                                                    end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` 
                                                }); 
                                                setIsAddSlotOpen(true); 
                                            }}
                                            className="h-40 w-full rounded-sm border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center group hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-700 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Plus className="h-6 w-6 text-foreground/10 group-hover:text-primary group-hover:scale-125 transition-all duration-700 relative z-10" />
                                            <span className="mt-4 text-[9px] font-black uppercase tracking-[0.5em] text-foreground/0 group-hover:text-primary group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-60 transition-all duration-500 relative z-10">Initialize</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-10 md:grid-cols-2">
                    <div className="group relative glass-card p-10 space-y-8 transition-all duration-700 hover:emerald-border-glow overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                             <CheckCircle2 className="h-48 w-48 text-primary" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Structural Integrity</p>
                                <div className="flex items-center gap-x-4">
                                    <h4 className="text-6xl font-black text-foreground italic leading-none">100</h4>
                                    <div className="px-2 py-1 bg-primary/20 border border-primary/20 rounded-xs text-primary font-black text-[10px] uppercase">Optimal</div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 leading-relaxed max-w-[280px] relative z-10 italic">
                            Temporal resource alignment verification complete. Zero collision probability detected.
                        </p>
                    </div>
                    
                    <div className="group relative glass-card p-10 space-y-8 transition-all duration-700 hover:emerald-border-glow overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                             <Zap className="h-48 w-48 text-primary" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Node Saturation</p>
                                <h4 className="text-6xl font-black text-foreground italic leading-none">{totalSlots}</h4>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 leading-relaxed max-w-[280px] relative z-10 italic">
                            Total institutional memory nodes allocated across the current operational cycle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

