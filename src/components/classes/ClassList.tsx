"use client";

import { useState, useEffect } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    Users,
    School,
    DoorOpen,
    Search,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Class } from "@/types/database";
import { toast } from "sonner";
import { ClassForm } from "./ClassForm";
import { deleteClass } from "@/app/actions/classes";
import { addSubjectToClass, getClassSubjects, removeSubjectFromClass } from "@/app/actions/class-subjects";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface ClassListProps {
    initialData: Class[];
    userRole?: string | null;
    teachers: { id: string; full_name: string }[];
    subjects: { id: string; name: string; code?: string }[];
    currentAcademicYearId?: string;
}

export function ClassList({ initialData, userRole, teachers, subjects, currentAcademicYearId }: ClassListProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [data, setData] = useState<Class[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const [subjectClass, setSubjectClass] = useState<Class | null>(null);
    const [classSubjectRecords, setClassSubjectRecords] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState("");

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const filteredData = data.filter((cls) => {
        const nameMatch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const roomMatch = cls.room_number?.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || roomMatch;
    });

    const onAdd = () => {
        setEditingClass(null);
        setIsOpen(true);
    };

    const onEdit = (cls: Class) => {
        setEditingClass(cls);
        setIsOpen(true);
    };

    const loadClassSubjects = async (classId: string) => {
        const result = await getClassSubjects(classId, currentAcademicYearId);
        if (!result.success) {
            toast.error(result.error || "Failed to load class subjects");
            return;
        }
        setClassSubjectRecords(result.classSubjects);
    };

    const onManageSubjects = async (cls: Class) => {
        setSubjectClass(cls);
        setSelectedSubjectId("");
        setIsSubjectsOpen(true);
        await loadClassSubjects(cls.id);
    };

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this class?")) return;
        const res = await deleteClass(id);
        if (res.success) {
            toast.success("Class deleted successfully");
            router.refresh();
            setData(data.filter(c => c.id !== id));
        } else {
            toast.error(res.error || "Failed to delete class");
        }
    };

    const totalCapacity = data.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const uniqueRooms = new Set(data.map(c => c.room_number).filter(Boolean)).size;
    const assignedSubjectIds = new Set(classSubjectRecords.map((record) => record.subject_id));
    const availableSubjects = subjects.filter((subject) => !assignedSubjectIds.has(subject.id));

    const handleAddSubject = async () => {
        if (!subjectClass || !selectedSubjectId) {
            toast.error("Please choose a subject to assign.");
            return;
        }

        const result = await addSubjectToClass(subjectClass.id, selectedSubjectId, currentAcademicYearId);
        if (!result.success) {
            toast.error(result.error || "Failed to assign subject");
            return;
        }

        toast.success("Subject assigned to class");
        setSelectedSubjectId("");
        await loadClassSubjects(subjectClass.id);
        router.refresh();
    };

    const handleRemoveSubject = async (recordId: string) => {
        const result = await removeSubjectFromClass(recordId);
        if (!result.success) {
            toast.error(result.error || "Failed to remove subject");
            return;
        }

        toast.success("Subject removed from class");
        if (subjectClass) {
            await loadClassSubjects(subjectClass.id);
        }
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardStatCard 
                    title="Total Classes" 
                    value={data.length} 
                    icon={School} 
                    color="blue" 
                    description="Active sections" 
                />
                <DashboardStatCard 
                    title="Total Capacity" 
                    value={totalCapacity} 
                    icon={Users} 
                    color="emerald" 
                    description="Total Seats" 
                />
                <DashboardStatCard 
                    title="Allocated Rooms" 
                    value={uniqueRooms} 
                    icon={DoorOpen} 
                    color="indigo" 
                    description="Assigned Rooms" 
                />
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by class name or room..."
                            className="h-12 pl-12 rounded-[1.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isAdminOrTeacher && (
                        <Button onClick={onAdd} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] gap-2 px-6 h-12 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">
                            <Plus className="h-4 w-4" /> Add Class
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredData.length === 0 ? (
                        <div className="col-span-full p-24 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem]">
                            <School className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-6" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No classes found</p>
                        </div>
                    ) : (
                        filteredData.map((cls, idx) => (
                            <div 
                                key={cls.id} 
                                className="group relative flex flex-col p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-lg shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                        <School className="h-6 w-6 stroke-[1.5]" />
                                    </div>
                                    
                                    {isAdminOrTeacher && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-200/60 shadow-xl overflow-hidden p-1">
                                                <DropdownMenuLabel className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 px-3 py-2">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit(cls)} className="flex items-center gap-3 cursor-pointer rounded-xl font-bold text-xs text-slate-600 focus:bg-slate-50 focus:text-emerald-600 p-3">
                                                    <Pencil className="h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onManageSubjects(cls)} className="flex items-center gap-3 cursor-pointer rounded-xl font-bold text-xs text-slate-600 focus:bg-slate-50 focus:text-blue-600 p-3">
                                                    <BookOpen className="h-4 w-4" /> Manage Subjects
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                                <DropdownMenuItem onClick={() => onDelete(cls.id)} className="flex items-center gap-3 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-xl font-bold text-xs p-3">
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                <div className="space-y-4 relative z-10 flex-1">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {cls.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                <DoorOpen className="h-3 w-3 text-slate-400" />
                                                {cls.room_number || "No Room"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">
                                                <Users className="h-3 w-3" />
                                                {cls.capacity || "N/A"} Seats
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subjects List */}
                                    {((cls as any).assignedSubjects?.length > 0) && (
                                        <div className="pt-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Subjects</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {((cls as any).assignedSubjects).slice(0, 3).map((sub: any) => (
                                                    <span key={sub.id} className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                                        {sub.name}
                                                    </span>
                                                ))}
                                                {((cls as any).assignedSubjects).length > 3 && (
                                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800/60">
                                                        +{(cls as any).assignedSubjects.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner">
                                        {((cls as any).teacher?.full_name?.[0] || '?')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {(cls as any).teacher?.full_name || "Unassigned"}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                            Class Teacher
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Decorative Bottom Bar */}
                                <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700 delay-100" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {editingClass ? "Edit Class" : "Add New Class"}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500">
                                {editingClass ? "Update class details" : "Create a new class"}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8">
                        <ClassForm
                            initialData={editingClass}
                            teachers={teachers}
                            onSuccess={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isSubjectsOpen} onOpenChange={setIsSubjectsOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Manage Subjects</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                            Add subjects to <span className="text-blue-600 font-bold">{subjectClass?.name}</span>
                        </DialogDescription>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex gap-4">
                            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                <SelectTrigger className="h-10 rounded-md flex-1">
                                    <SelectValue placeholder="Choose a subject to add" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSubjects.length === 0 ? (
                                        <SelectItem value="none" disabled>All subjects are already assigned</SelectItem>
                                    ) : (
                                        availableSubjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name}{subject.code ? ` (${subject.code})` : ""}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddSubject} className="rounded-md bg-emerald-600 hover:bg-emerald-700">Add</Button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {classSubjectRecords.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-200/60 dark:border-slate-800/60 p-12 text-sm text-slate-500 font-medium text-center rounded-[2rem]">
                                    No subjects assigned yet.
                                </div>
                            ) : (
                                classSubjectRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl hover:border-emerald-500/30 transition-all bg-white/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-4">
                                          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm font-black shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/20">
                                            {record.subject?.name?.[0] || 'S'}
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-900 dark:text-white">{record.subject?.name}</p>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{record.subject?.code || "NO CODE"}</p>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors" onClick={() => handleRemoveSubject(record.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
