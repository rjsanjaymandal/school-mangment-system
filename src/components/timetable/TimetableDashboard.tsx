"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    CheckCircle2,
    Zap,
    AlertCircle,
    AlertTriangle,
    User,
    Activity,
    BookMarked,
    LayoutGrid,
    Trash2,
    Edit,
    Printer,
    ArrowRightCircle,
    Loader2,
    Settings,
    MoreVertical,
    Copy,
    UserCircle,
    BookOpenCheck,
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip as RechartsTooltip, Legend, 
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { createTimetableSlot, deleteTimetableSlot, updateTimetableSlot } from "@/app/actions/timetable";
import { generateOptimizedSchedule, getTeacherLoad, checkScheduleConflicts, getTodayProxies, markStaffAttendance } from "@/app/actions/timetable-autonomous";
import { bulkGenerateSchedule, getClassTimetableOverview, clearTimetableForClass, copyTimetableToDay } from "@/app/actions/timetable-enterprise";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const COLORS = ["blue", "purple", "indigo", "emerald", "amber", "rose"];

interface TimetableDashboardProps {
    timetables: any[];
    classes: any[];
    subjects: any[];
    teachers: any[];
    classSubjects: any[];
    academicYears: any[];
    userRole: string;
}

export function TimetableDashboard({ timetables, classes, subjects, teachers, classSubjects, academicYears, userRole }: TimetableDashboardProps) {
    const router = useRouter();
    const today = useMemo(() => {
        const detectedDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
        return WEEKDAYS.includes(detectedDay) ? detectedDay : "Monday";
    }, []);
    const [selectedDay, setSelectedDay] = useState(today);
    const [selectedClass, setSelectedClass] = useState(() => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("timetable_selected_class") || "";
    });
    
    // Persistence for selected class
    useEffect(() => {
        if (selectedClass && !localStorage.getItem("timetable_selected_class")) {
            localStorage.setItem("timetable_selected_class", selectedClass);
        }
    }, [selectedClass]);

    const handleClassChange = (val: string) => {
        setSelectedClass(val);
        localStorage.setItem("timetable_selected_class", val);
    };
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
    
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
    const [isEditSlotOpen, setIsEditSlotOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generatingSchedule, setGeneratingSchedule] = useState(false);
    const [teacherLoadData, setTeacherLoadData] = useState<any[]>([]);
    const [hasConflicts, setHasConflicts] = useState(false);
    const [conflictCount, setConflictCount] = useState(0);
    const [todayProxies, setTodayProxies] = useState<any[]>([]);
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [classOverview, setClassOverview] = useState<any[]>([]);

    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const selectedTeacherId = selectedTeacher || teachers[0]?.id || "";

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

    const teacherLoadPieData = useMemo(() => {
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
    const currentAcademicYearId = currentAY?.id || "";

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

    const assignedSubjectIds = useMemo(() => {
        return classSubjects
            .filter((item: any) => item.class_id === selectedClass && (!currentAcademicYearId || !item.academic_year_id || item.academic_year_id === currentAcademicYearId))
            .map((item: any) => item.subject_id);
    }, [classSubjects, currentAcademicYearId, selectedClass]);

    const availableSubjects = useMemo(() => {
        if (assignedSubjectIds.length === 0) return subjects;
        const allowed = new Set(assignedSubjectIds);
        return subjects.filter((subject: any) => allowed.has(subject.id));
    }, [assignedSubjectIds, subjects]);

    const validationIssues = useMemo(() => {
        const issues: string[] = [];
        const dayBuckets = timetables.filter((t: any) => t.academic_year_id === currentAcademicYearId);

        dayBuckets.forEach((timetable: any) => {
            const slots = [...(timetable.slots || [])].sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            slots.forEach((slot: any, index: number) => {
                if (!slot.start_time || !slot.end_time || slot.start_time >= slot.end_time) {
                    issues.push(`Invalid time range for ${slot.subject?.name || "slot"}`);
                }

                slots.slice(index + 1).forEach((nextSlot: any) => {
                    const overlaps = slot.start_time < nextSlot.end_time && slot.end_time > nextSlot.start_time;
                    if (overlaps) {
                        issues.push(`Class overlap on ${timetable.day_of_week}`);
                    }
                });
            });
        });

        const teacherSlots = dayBuckets.flatMap((timetable: any) =>
            (timetable.slots || []).map((slot: any) => ({
                ...slot,
                day_of_week: timetable.day_of_week,
            })),
        );

        teacherSlots.forEach((slot: any, index: number) => {
            teacherSlots.slice(index + 1).forEach((nextSlot: any) => {
                const sameTeacher = slot.teacher_id && slot.teacher_id === nextSlot.teacher_id;
                const sameDay = slot.day_of_week === nextSlot.day_of_week;
                const overlaps = slot.start_time < nextSlot.end_time && slot.end_time > nextSlot.start_time;

                if (sameTeacher && sameDay && overlaps) {
                    issues.push(`Teacher conflict on ${slot.day_of_week}`);
                }
            });
        });

        return Array.from(new Set(issues));
    }, [currentAcademicYearId, timetables]);

    const handleCreateSlot = async () => {
        if (!selectedClass) {
            toast.error("Please select a class first.");
            return;
        }
        if (!currentAY) {
            toast.error("No active academic year found in settings.");
            return;
        }
        if (availableSubjects.length === 0) {
            toast.error("No subjects are assigned to this class yet.");
            return;
        }
        if (!slotForm.subject_id || !slotForm.teacher_id || !slotForm.start_time || !slotForm.end_time) {
            toast.error("Please fill in all required fields (Subject, Teacher, Start/End Time).");
            return;
        }
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
            
            // Force a brief delay to ensure revalidation completes
            setTimeout(() => {
                router.refresh();
            }, 100);
            
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
            setTimeout(() => {
                router.refresh();
            }, 100);
            toast.success("Schedule slot deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete slot");
        }
    };

    const handleUpdateSlot = async () => {
        if (!currentAY || !editingSlot) return;
        if (!slotForm.subject_id || !slotForm.teacher_id || !slotForm.start_time || !slotForm.end_time) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        const result = await updateTimetableSlot(editingSlot.id, {
            academic_year_id: currentAY.id,
            day_of_week: selectedDay,
            ...slotForm,
        });
        setLoading(false);
        if (result.success) {
            setIsEditSlotOpen(false);
            setEditingSlot(null);
            setSlotForm({ subject_id: "", teacher_id: "", start_time: "", end_time: "", room_number: "" });
            router.refresh();
            toast.success("Schedule slot updated successfully");
        } else {
            toast.error(result.error || "Failed to update schedule slot");
        }
    };

    const handleEditClick = (s: any) => {
        setEditingSlot(s);
        setSlotForm({
            subject_id: s.subject_id,
            teacher_id: s.teacher_id,
            start_time: s.start_time?.slice(0, 5) || "",
            end_time: s.end_time?.slice(0, 5) || "",
            room_number: s.room_number || ""
        });
        setIsEditSlotOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    // Debug: Log data to console
    useEffect(() => {
        console.log("Timetable Debug:", {
            timetablesCount: timetables.length,
            slotsInTimetables: timetables.reduce((sum, t) => sum + (t.slots?.length || 0), 0),
            currentAY: currentAY?.id,
            selectedClass,
            selectedDay,
            viewMode
        });
    }, [timetables, currentAY, selectedClass, selectedDay, viewMode]);

    // Fetch Teacher Load, Conflicts, and Proxies
    useEffect(() => {
        async function fetchAutonomousData() {
            if (!currentAY?.id) return;
            
            const [loadResult, conflictResult, proxyResult] = await Promise.all([
                getTeacherLoad(currentAY.id),
                checkScheduleConflicts(currentAY.id),
                getTodayProxies()
            ]);

            if (loadResult.success) {
                setTeacherLoadData(loadResult.data || []);
            }
            
            if (conflictResult.success) {
                setHasConflicts(conflictResult.hasConflicts || false);
                setConflictCount(conflictResult.data?.length || 0);
            }
            
            if (proxyResult.success) {
                setTodayProxies(proxyResult.data || []);
            }
        }
        
        if (isAdminOrTeacher) {
            fetchAutonomousData();
        }
    }, [currentAY?.id, isAdminOrTeacher, timetables]);

    const handleGenerateOptimizedSchedule = async () => {
        if (!currentAY?.id) {
            toast.error("No active academic year");
            return;
        }
        
        setGeneratingSchedule(true);
        const result = await generateOptimizedSchedule(currentAY.id, selectedClass || undefined);
        setGeneratingSchedule(false);
        
        if (result.success) {
            const filledCount = result.data?.filter((d: any) => d.was_filled).length || 0;
            toast.success(`Optimized schedule generated! ${filledCount} slots filled.`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to generate schedule");
        }
    };

    const handleBulkGenerate = async () => {
        if (!currentAY?.id) {
            toast.error("No active academic year");
            return;
        }
        
        setBulkGenerating(true);
        const result = await bulkGenerateSchedule(currentAY.id);
        setBulkGenerating(false);
        
        if (result.success) {
            const successCount = result.data?.filter((d: any) => d.success)?.length || 0;
            toast.success(`Generated schedules for ${successCount} classes!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to bulk generate");
        }
    };

    // Filter timetable slots based on view mode (Class vs Teacher)
    const activeSlots = useMemo(() => {
        // Aggregate all slots across all timetables for this criteria on this day
        const filteredSlots: any[] = [];
        const matchingTimetables = timetables.filter(
            (t: any) => t.day_of_week === selectedDay && t.academic_year_id === currentAcademicYearId
        );

        if (viewMode === "class") {
            matchingTimetables
                .filter((t: any) => t.class_id === selectedClass)
                .forEach((t: any) => {
                    t.slots?.forEach((s: any) => {
                        filteredSlots.push(s);
                    });
                });
        } else {
            matchingTimetables.forEach((t: any) => {
                    t.slots?.forEach((s: any) => {
                        if (s.teacher_id === selectedTeacherId) {
                            filteredSlots.push({ ...s, class_name: t.class?.name });
                        }
                    });
                });
        }
        return filteredSlots;
    }, [currentAcademicYearId, selectedClass, selectedDay, selectedTeacherId, timetables, viewMode]);

    // Slots that don't fit into the 07:00-20:00 hourly buckets
    const unmappedSlots = useMemo(() => {
        const hoursInGrid = new Set(TIME_SLOTS.map(t => t.split(':')[0].padStart(2, '0')));
        return activeSlots.filter((s: any) => {
            const h = s.start_time?.split(':')[0]?.padStart(2, '0');
            return !hoursInGrid.has(h);
        });
    }, [activeSlots]);

    // Count total slots across all days for analytics
    const totalSlots = useMemo(() => {
        if (viewMode === "class") {
            return timetables
                .filter((t: any) => t.class_id === selectedClass && t.academic_year_id === currentAcademicYearId)
                .reduce((sum: number, t: any) => sum + (t.slots?.length || 0), 0);
        } else {
            return timetables
                .filter((t: any) => t.academic_year_id === currentAcademicYearId)
                .reduce((sum: number, t: any) => sum + (t.slots?.filter((s: any) => s.teacher_id === selectedTeacherId).length || 0), 0);
        }
    }, [currentAcademicYearId, selectedClass, selectedTeacherId, timetables, viewMode]);

    const printableSlotsByDay = useMemo(() => {
        return WEEKDAYS.reduce<Record<string, any[]>>((acc, day) => {
            const matchingTimetables = timetables.filter(
                (t: any) => t.day_of_week === day && t.academic_year_id === currentAcademicYearId,
            );

            if (viewMode === "class") {
                acc[day] = matchingTimetables
                    .filter((t: any) => t.class_id === selectedClass)
                    .flatMap((t: any) => (t.slots || []).map((slot: any) => ({ ...slot, class_name: t.class?.name })))
                    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            } else {
                acc[day] = matchingTimetables
                    .flatMap((t: any) =>
                        (t.slots || [])
                            .filter((slot: any) => slot.teacher_id === selectedTeacherId)
                            .map((slot: any) => ({ ...slot, class_name: t.class?.name })),
                    )
                    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            }

            return acc;
        }, {});
    }, [currentAcademicYearId, selectedClass, selectedTeacherId, timetables, viewMode]);

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
                    {viewMode === "class" && selectedClass && (
                        <div className="flex items-center gap-x-2 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Class Teacher:</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                {classes.find((c: any) => c.id === selectedClass)?.teacher?.profile?.full_name || "Not Assigned"}
                            </span>
                            {hasConflicts && (
                                <Badge variant="destructive" className="ml-4 animate-pulse text-[10px] h-5">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> {conflictCount} Conflicts Detected
                                </Badge>
                            )}
                            {todayProxies.length > 0 && (
                                <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5">
                                    <Zap className="h-3 w-3 mr-1" /> {todayProxies.length} Proxies Today
                                </Badge>
                            )}
                        </div>
                    )}
                    <p className="text-muted-foreground mt-4 text-sm max-w-md">
                        Manage your weekly class timetable and institutional resource allocations.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode Toggle */}
                    {isAdminOrTeacher && (
                        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                            <Button 
                                variant={viewMode === "class" ? "default" : "ghost"} 
                                size="sm" 
                                className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                onClick={() => setViewMode("class")}
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Class
                            </Button>
                            <Button 
                                variant={viewMode === "teacher" ? "default" : "ghost"} 
                                size="sm" 
                                className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                onClick={() => setViewMode("teacher")}
                            >
                                <User className="h-3.5 w-3.5 mr-2" /> Teacher
                            </Button>
                        </div>
                    )}

                    {viewMode === "class" ? (
                        <div className="relative group">
                            <Select value={selectedClass} onValueChange={handleClassChange}>
                                <SelectTrigger className="w-[240px] h-12 bg-background border-border font-medium">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="relative group">
                            <Select value={selectedTeacherId} onValueChange={setSelectedTeacher}>
                                <SelectTrigger className="w-[240px] h-12 bg-background border-border font-medium">
                                    <SelectValue placeholder="Select Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((t: any) => (
                                        <SelectItem key={t.id} value={t.id}>{t.profile?.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl bg-background border-border hover:bg-muted transition-all no-print"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>

                    {isAdminOrTeacher && viewMode === "class" && (
                        <>
                            <Button 
                                variant="outline"
                                onClick={handleBulkGenerate}
                                disabled={bulkGenerating}
                                className="h-12 px-4 flex items-center gap-x-2 border-border"
                            >
                                {bulkGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutGrid className="h-4 w-4" />}
                                Bulk Generate All
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={handleGenerateOptimizedSchedule} 
                                disabled={generatingSchedule}
                                className="h-12 px-6 flex items-center gap-x-2 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none transition-all hover:scale-105 active:scale-95"
                            >
                                {generatingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                Generate
                            </Button>
                        

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border no-print">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-border">
                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Manage Class Timetable</DropdownMenuLabel>
                                    <DropdownMenuItem 
                                        className="rounded-lg gap-x-2 text-sm py-2 cursor-pointer"
                                        onClick={() => {
                                            if (confirm("Are you sure you want to clear all slots for this class?")) {
                                                clearTimetableForClass(selectedClass, currentAY.id).then(() => {
                                                    toast.success("Timetable cleared");
                                                    router.refresh();
                                                });
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="text-destructive font-medium">Clear All Slots</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="rounded-lg gap-x-2 text-sm py-2 cursor-pointer"
                                        onClick={() => {
                                            const targetDays = WEEKDAYS.filter(d => d !== selectedDay);
                                            copyTimetableToDay(selectedDay, targetDays).then(() => {
                                                toast.success("Schedule copied to other days");
                                                router.refresh();
                                            });
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span>Copy Day to Rest of Week</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-8 flex items-center gap-x-2 shadow-sm bg-primary hover:bg-primary/90 rounded-xl transition-all">
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
                                    
                                    {(availableSubjects.length === 0 || teachers.length === 0) && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>
                                                {availableSubjects.length === 0 && teachers.length === 0 
                                                    ? "No class subjects or teachers found. Please complete both before creating a schedule."
                                                    : availableSubjects.length === 0 
                                                        ? "No subjects are assigned to this class yet. Use class subject management first."
                                                        : "No active teachers found. Please add teachers before creating a schedule."}
                                            </p>
                                        </div>
                                    )}

                                    {assignedSubjectIds.length > 0 && (
                                        <div className="p-3 rounded-lg border border-primary/15 bg-primary/5 text-[11px] text-primary">
                                            Subject options are limited to the subjects assigned to this class for the active academic year.
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Subject</Label>
                                            <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSubjects.map((s: any) => (
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
                                                    {teachers.map((t: any) => {
                                                        const subject = subjects.find(sub => sub.id === slotForm.subject_id);
                                                        const isExpert = subject?.expertise?.required_tags?.some((tag: string) => 
                                                            t.expertise_tags?.includes(tag)
                                                        );
                                                        const teacherLoad = teacherLoadData.find(ld => ld.teacher_id === t.id);
                                                        const isOverloaded = teacherLoad?.is_overloaded;

                                                        return (
                                                            <SelectItem key={t.id} value={t.id}>
                                                                <div className="flex items-center justify-between w-[300px]">
                                                                    <span className={cn(
                                                                        isExpert && "text-emerald-600 font-bold",
                                                                        isOverloaded && "text-rose-600"
                                                                    )}>
                                                                        {t.profile?.full_name}
                                                                        {isExpert && " (Expert)"}
                                                                        {isOverloaded && " (Overloaded)"}
                                                                    </span>
                                                                    <span className="text-[10px] opacity-50">
                                                                        {teacherLoad?.daily_hours || 0}/{t.max_daily_hours || 6}h
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
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
                        </>
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
                                    <RechartsTooltip 
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
                    <div className="mb-4 relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight uppercase leading-none text-foreground">
                                Teacher <span className="text-primary font-light px-1">/</span> Load
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">Hours Scheduled / Max Hours</p>
                        </div>
                        {isAdminOrTeacher && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleGenerateOptimizedSchedule}
                                disabled={generatingSchedule}
                                className="text-[10px] h-8"
                            >
                                {generatingSchedule ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                                Auto-Schedule
                            </Button>
                        )}
                    </div>
                    <div className="h-[240px] w-full mt-4 overflow-y-auto pr-2 scrollbar-thin">
                        {teacherLoadData.length > 0 ? (
                            <div className="space-y-4">
                                {teacherLoadData.slice(0, 8).map((t: any) => (
                                    <div key={t.teacher_id} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">
                                                {t.teacher_name}
                                            </span>
                                            <span className={cn(
                                                "text-[9px] font-black",
                                                t.is_overloaded ? "text-rose-500" : "text-muted-foreground"
                                            )}>
                                                {t.daily_hours} / {t.max_daily_hours} HR
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    t.is_overloaded ? "bg-rose-500" : 
                                                    t.utilization_pct > 80 ? "bg-amber-500" : "bg-primary"
                                                )}
                                                style={{ width: `${Math.min(100, t.utilization_pct)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm h-full flex flex-col justify-center items-center">
                                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-20" />
                                <p>Calculating staff loads...</p>
                            </div>
                        )}
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
                                <div className="flex items-center gap-x-2 relative z-10">
                                    <span>{day}</span>
                                    {today === day && (
                                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black tracking-tighter uppercase ${
                                            selectedDay === day ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                        }`}>Today</span>
                                    )}
                                </div>
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
                            const hour = time.split(':')[0].padStart(2, '0');
                            const matchingSlots = activeSlots
                                .filter((s: any) => {
                                    const sHour = s.start_time?.split(':')[0]?.padStart(2, '0');
                                    return sHour === hour;
                                })
                                .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
                                
                            return (
                                <div key={time} className="flex-1 min-w-[220px] space-y-8 no-print animate-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: `${parseInt(time) * 50}ms` }}>
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
                                                className={cn(
                                                    "group relative p-4 rounded-xl border transition-all duration-300",
                                                    "hover:shadow-lg hover:-translate-y-1 hover:border-primary/30",
                                                    s.is_proxy 
                                                        ? "bg-amber-50/50 border-amber-200 shadow-sm" 
                                                        : "bg-white border-slate-100 shadow-sm"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className={cn(
                                                            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                                                            s.is_proxy ? "bg-amber-100" : "bg-primary/10"
                                                        )}>
                                                            <BookOpenCheck className={cn("h-4 w-4", s.is_proxy ? "text-amber-600" : "text-primary")} />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-slate-900 truncate">
                                                            {s.subject?.name || "No Subject"}
                                                        </h4>
                                                    </div>
                                                    
                                                    {isAdminOrTeacher && viewMode === "class" && (
                                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 rounded-lg hover:bg-slate-100"
                                                                onClick={() => handleEditClick(s)}
                                                            >
                                                                <Settings className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-600"
                                                                onClick={() => handleDeleteSlot(s.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-fit uppercase tracking-tighter">
                                                        <Clock className="h-3 w-3 mr-1.5 text-slate-400" />
                                                        {s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-slate-200">
                                                            {s.teacher?.profile?.avatar_url ? (
                                                                <img src={s.teacher.profile.avatar_url} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <UserCircle className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-slate-700 truncate">
                                                                {viewMode === "class" ? (s.teacher?.profile?.full_name || "Unassigned") : s.class_name}
                                                            </p>
                                                            {s.is_proxy && (
                                                                <p className="text-[9px] font-bold text-amber-600 flex items-center">
                                                                    <Zap className="h-2.5 w-2.5 mr-0.5 animate-pulse" /> Proxy Active
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {s.room_number && (
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-1.5 flex items-center gap-1">
                                                            <MapPin className="h-2.5 w-2.5" /> Room: {s.room_number}
                                                        </div>
                                                    )}
                                                </div>

                                                {s.auto_assigned && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                                            <Zap className="h-2.5 w-2.5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isAdminOrTeacher && viewMode === "class" && matchingSlots.length === 0 && (
                                            <button 
                                                onClick={() => { 
                                                    setSlotForm({ 
                                                        ...slotForm, 
                                                        start_time: time, 
                                                        end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` 
                                                    }); 
                                                    setIsAddSlotOpen(true); 
                                                }}
                                                className="h-32 w-full rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center group hover:border-primary/40 hover:bg-primary/5 transition-all mt-4"
                                            >
                                                <Plus className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary transition-all" />
                                                <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">Add Slot</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unmapped / Other Slots */}
                        {unmappedSlots.length > 0 && (
                            <div className="flex-1 min-w-[220px] space-y-8 no-print animate-in slide-in-from-right-10 duration-1000">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-rose-500 italic">Others</p>
                                        <div className="h-px flex-1 bg-rose-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {unmappedSlots.map((s: any) => (
                                        <div 
                                            key={s.id} 
                                            className="group relative bg-rose-500/5 border border-rose-500/20 p-5 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-x-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</span>
                                                </div>
                                                {isAdminOrTeacher && (
                                                    <div className="flex items-center gap-x-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500 transition-colors"
                                                            onClick={() => handleEditClick(s)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                                                            onClick={() => handleDeleteSlot(s.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-foreground text-sm uppercase tracking-tight group-hover:text-rose-500 transition-colors leading-tight">
                                                    {s.subject?.name || "No Subject"}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-x-2 uppercase">
                                                    {viewMode === "class" ? s.teacher?.profile?.full_name : s.class_name}
                                                </p>
                                                {s.room_number && (
                                                    <p className="text-[9px] text-rose-500/70 font-bold uppercase tracking-widest border-t border-rose-500/10 pt-1 mt-1 flex items-center gap-x-1">
                                                        <MapPin className="h-2.5 w-2.5 text-rose-500/60" /> Room {s.room_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Schedule Status</p>
                                    <div className="flex items-center gap-x-4">
                                        <h4 className="text-4xl font-bold text-foreground leading-none">
                                            {!hasConflicts && validationIssues.length === 0 ? "Healthy" : "Conflict Detected"}
                                        </h4>
                                        <div className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase ${
                                            !hasConflicts && validationIssues.length === 0
                                                ? "bg-primary/10 border border-primary/20 text-primary"
                                                : "bg-rose-500/10 border border-rose-500/20 text-rose-600"
                                        }`}>
                                            {!hasConflicts && validationIssues.length === 0 ? "All Clear" : `${conflictCount + validationIssues.length} Issue${conflictCount + validationIssues.length > 1 ? "s" : ""}`}
                                        </div>
                                    </div>
                                </div>
                                {!hasConflicts && validationIssues.length === 0 ? (
                                    <CheckCircle2 className="h-8 w-8 text-primary opacity-30" />
                                ) : (
                                    <AlertTriangle className="h-8 w-8 text-rose-500 opacity-30" />
                                )}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[280px] mt-4">
                                {!hasConflicts && validationIssues.length === 0
                                    ? "No teacher overlaps or resource conflicts detected."
                                    : hasConflicts 
                                        ? `Teacher conflict detected: ${conflictCount} overlap(s)` 
                                        : validationIssues[0]}
                            </p>
                        </div>
                        
                        <div className="bg-card border border-border p-8 rounded-xl shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Slots</p>
                                    <h4 className="text-5xl font-bold text-foreground leading-none">{totalSlots}</h4>
                                </div>
                                <Activity className="h-8 w-8 text-primary opacity-20" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[280px] mt-4">
                                Total scheduled periods across the current academic week.
                            </p>
                        </div>

                        {/* Today's Proxies */}
                        <div className="bg-card border border-amber-500/30 p-8 rounded-xl shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Today's Proxies</p>
                                    <h4 className="text-5xl font-bold text-foreground leading-none">{todayProxies.length}</h4>
                                </div>
                                <ArrowRightCircle className="h-8 w-8 text-amber-500 opacity-30" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-[280px] mt-4">
                                {todayProxies.length === 0 
                                    ? "No auto-substitutions for today."
                                    : `${todayProxies.length} substitution(s) assigned automatically.`}
                            </p>
                            {todayProxies.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                                    {todayProxies.slice(0, 2).map((proxy: any, idx: number) => (
                                        <p key={idx} className="text-[9px] text-amber-600 truncate">
                                            {proxy.original_teacher} → {proxy.proxy_teacher} ({proxy.class_name})
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div className="print-only hidden p-10 bg-white text-black min-h-screen">
                <div className="flex justify-between items-end mb-10 border-b-2 border-black pb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Academic Timetable</h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-600 mt-2">
                            {viewMode === "class" 
                                ? `Class: ${classes.find(c => c.id === selectedClass)?.name || "N/A"}` 
                                : `Teacher: ${teachers.find(t => t.id === selectedTeacher)?.profile?.full_name || "N/A"}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Academic Year</p>
                        <p className="text-lg font-black uppercase tracking-tight">{currentAY?.name || "N/A"}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="space-y-4">
                            <h3 className="text-xl font-bold uppercase tracking-widest text-black border-l-4 border-black pl-4">{day}</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {printableSlotsByDay[day]?.map((s: any) => (
                                    <div key={s.id} className="border border-gray-300 p-4 rounded-none bg-gray-50">
                                        <p className="text-[10px] font-bold uppercase mb-1">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</p>
                                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">{s.subject?.name}</h4>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase">
                                            {viewMode === "class" ? s.teacher?.profile?.full_name : s.class_name} | {s.room_number}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Slot Dialog */}
            <Dialog open={isEditSlotOpen} onOpenChange={setIsEditSlotOpen}>
                <DialogContent className="sm:max-w-[500px] p-0">
                    <DialogHeader className="p-6 border-b border-border bg-muted/50">
                        <DialogTitle>Edit Schedule Slot</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">Modify the existing class schedule entry.</p>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-x-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                                <Edit className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Editing Entry</p>
                                <p className="font-semibold text-lg text-foreground">
                                    {selectedDay} <span className="text-muted-foreground font-light px-1">/</span> {editingSlot?.subject?.name}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Subject</Label>
                                <Select value={slotForm.subject_id} onValueChange={(v) => setSlotForm({ ...slotForm, subject_id: v })}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubjects.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Teacher</Label>
                                <Select value={slotForm.teacher_id} onValueChange={(v) => setSlotForm({ ...slotForm, teacher_id: v })}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>{t.profile?.full_name}</SelectItem>
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
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleUpdateSlot} disabled={loading} className="w-full h-12 text-sm font-semibold uppercase tracking-wider bg-amber-600 hover:bg-amber-700">
                            {loading ? "Updating..." : "Update Schedule Slot"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
}
