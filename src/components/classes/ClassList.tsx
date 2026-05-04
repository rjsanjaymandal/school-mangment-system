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
        if (!confirm("Are you sure you want to permanently delete this institutional node?")) return;
        const res = await deleteClass(id);
        if (res.success) {
            toast.success("Institutional node purged successfully");
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
        <div className="space-y-12 page-fade-in">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Total Classes", value: data.length, icon: School, color: "blue", sub: "Active sections" },
                    { label: "Total Capacity", value: totalCapacity, icon: Users, color: "emerald", sub: "Allocated seats" },
                    { label: "Allocated Rooms", value: uniqueRooms, icon: DoorOpen, color: "indigo", sub: "Institutional space" },
                ].map((stat, i) => (
                    <Card key={i} className="card-premium rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {stat.label}
                            </p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                                {stat.value.toString().padStart(2, '0')}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                                {stat.sub}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="relative flex-1 w-full md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by class name or room..."
                            className="h-14 pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isAdminOrTeacher && (
                        <Button onClick={onAdd} className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2">
                            <Plus className="h-4 w-4" /> Add Class
                        </Button>
                    )}
                </div>

                <Card className="card-premium rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                    <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Class Name</th>
                                    <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Capacity</th>
                                    <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Room No.</th>
                                    <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Class Teacher</th>
                                    {isAdminOrTeacher && <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrTeacher ? 5 : 4} className="py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <School className="h-12 w-12 mb-4 text-slate-200 dark:text-slate-800" />
                                                <p className="text-sm font-medium text-slate-400 italic">No classes matched the search criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((cls) => (
                                        <tr key={cls.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="py-6 px-10 font-bold text-slate-900 dark:text-white text-base">
                                                {cls.name}
                                            </td>
                                            <td className="py-6 px-10 text-slate-500 dark:text-slate-400 font-medium">
                                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 font-bold">
                                                    <Users className="h-3 w-3 mr-2" />
                                                    {cls.capacity || "N/A"} Seats
                                                </Badge>
                                            </td>
                                            <td className="py-6 px-10 text-slate-500 dark:text-slate-400 font-medium italic">
                                                {cls.room_number || "UNALLOCATED"}
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                        {((cls as any).teacher?.full_name?.[0] || 'U')}
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {(cls as any).teacher?.full_name || "Not Assigned"}
                                                    </span>
                                                </div>
                                            </td>
                                            {isAdminOrTeacher && (
                                                <td className="py-6 px-10 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center rounded-xl">
                                                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Entity Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => onEdit(cls)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                                <Pencil className="h-4 w-4 text-indigo-500" /> Modify Section
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onManageSubjects(cls)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                                <BookOpen className="h-4 w-4 text-emerald-500" /> Manage Subjects
                              </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
                                                            <DropdownMenuItem onClick={() => onDelete(cls.id)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                                <Trash2 className="h-4 w-4" /> Purge Section
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem]">
                    <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {editingClass ? "Modify Section" : "New Institutional Section"}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                                {editingClass ? "Update the structural parameters of this section." : "Initialize a new academic section within the institutional framework."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        <ClassForm
                            initialData={editingClass}
                            teachers={teachers}
                            onSuccess={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isSubjectsOpen} onOpenChange={setIsSubjectsOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem]">
                    <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Curriculum Map</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                            Curriculum node allocations for <span className="text-blue-500 font-bold">{subjectClass?.name}</span>.
                        </DialogDescription>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="flex gap-4">
                            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Choose a subject to add" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
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
                            <Button onClick={handleAddSubject} className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">Add</Button>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {classSubjectRecords.length === 0 ? (
                                <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 p-10 text-sm text-slate-400 text-center italic">
                                    No curriculum nodes assigned yet.
                                </div>
                            ) : (
                                classSubjectRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all group">
                                        <div className="flex items-center gap-4">
                                          <div className="h-10 w-10 flex items-center justify-center font-bold text-blue-500 text-xs rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                                            {record.subject?.name?.[0] || 'S'}
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-900 dark:text-white text-base leading-none mb-1">{record.subject?.name}</p>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{record.subject?.code || "NO-CODE"}</p>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all" onClick={() => handleRemoveSubject(record.id)}>
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
