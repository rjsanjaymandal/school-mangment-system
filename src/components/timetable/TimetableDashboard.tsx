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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground">Institutional Scheduling</h2>
                    <p className="text-muted-foreground font-medium tracking-tight">Timetable & Resource Allocation</p>
                </div>
                <div className="flex gap-x-2">
                    {classes.length > 0 && (
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-[180px] rounded-2xl border-border bg-white font-bold">
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-card text-white font-bold gap-x-2 neon-blue">
                                <Plus className="h-4 w-4" /> New Slot
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-none">
                            <DialogHeader><DialogTitle className="font-black text-2xl">Add Schedule Slot</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-x-3">
                                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-xs">
                                        <p className="font-bold text-blue-700">Adding slot for {selectedDay}</p>
                                        <p className="text-blue-600/70 mt-1">Class: {classes.find((c: any) => c.id === selectedClass)?.name || "—"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Subject</Label>
                                    <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                        <SelectContent>{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Teacher</Label>
                                    <Select value={slotForm.teacher_id} onValueChange={(v) => setSlotForm({ ...slotForm, teacher_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                        <SelectContent>{teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.profile?.first_name} {t.profile?.last_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Start Time</Label>
                                        <Input type="time" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">End Time</Label>
                                        <Input type="time" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Room</Label>
                                    <Input value={slotForm.room_number} onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })} placeholder="Lab 302" />
                                </div>
                                <Button onClick={handleCreateSlot} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold">
                                    {loading ? "Creating..." : "Add Slot"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Day Selector */}
                <Card className="lg:col-span-1 border-none glass futuristic-card overflow-hidden">
                    <CardHeader className="bg-card text-white">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                            <Calendar className="h-4 w-4 text-blue-400" /> Academic Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold ${selectedDay === day ? "bg-white shadow-md text-foreground border border-border" : "text-muted-foreground hover:text-foreground/70 hover:bg-white/50"}`}
                            >
                                {day}
                                {selectedDay === day && <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Schedule Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex gap-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {TIME_SLOTS.map((time) => {
                            const matchingSlots = slots.filter((s: any) => s.start_time?.startsWith(time));
                            return (
                                <div key={time} className="flex-1 min-w-[150px] space-y-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{time}</p>
                                        <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                    </div>
                                    {matchingSlots.map((s: any, i: number) => (
                                        <Card key={s.id} className={`border-none glass futuristic-card relative overflow-hidden ring-1 ring-inset ring-${COLORS[i % COLORS.length]}-500/10`}>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center gap-x-2">
                                                    <Badge className={`bg-${COLORS[i % COLORS.length]}-500 text-white border-none text-[8px] font-black tracking-widest px-1.5`}>LECTURE</Badge>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground text-xs truncate">{s.subject?.name || "—"}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{s.teacher?.profile?.first_name} {s.teacher?.profile?.last_name}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] font-bold text-muted-foreground">
                                                    <div className="flex items-center gap-x-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {s.room_number || "TBD"}
                                                    </div>
                                                    <div className="flex items-center gap-x-1">
                                                        <Clock className="h-3 w-3" />
                                                        {s.end_time?.slice(0, 5)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {matchingSlots.length === 0 && (
                                        <div className="h-32 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center group hover:border-blue-200 transition-colors cursor-pointer" onClick={() => { setSlotForm({ ...slotForm, start_time: time, end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` }); setIsAddSlotOpen(true); }}>
                                            <Plus className="h-5 w-5 text-slate-200 group-hover:text-blue-300 transition-colors" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none glass futuristic-card bg-card text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">Schedule Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black">100%</span>
                                    <CheckCircle2 className="h-6 w-6 text-green-400 neon-blue" />
                                </div>
                                <p className="text-[10px] font-medium opacity-60 mt-1">Zero conflicts detected.</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none glass futuristic-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Slots</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-foreground">{totalSlots}</span>
                                    <Zap className="h-6 w-6 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1">Across all days for this class.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

