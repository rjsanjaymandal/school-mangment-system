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
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Total Classes", value: data.length, icon: School, color: "bg-blue-100 text-blue-600", sub: "Active sections" },
                    { label: "Total Capacity", value: totalCapacity, icon: Users, color: "bg-emerald-100 text-emerald-600", sub: "Allocated seats" },
                    { label: "Allocated Rooms", value: uniqueRooms, icon: DoorOpen, color: "bg-indigo-100 text-indigo-600", sub: "Institutional space" },
                ].map((stat, i) => (
                    <Card key={i} className="border-l-4 border-l-emerald-500 shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div className={`h-10 w-10 rounded-md ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-medium text-slate-500">
                                {stat.label}
                            </p>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-slate-900">
                                {stat.value}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stat.sub}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by class name or room..."
                            className="h-10 pl-10 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isAdminOrTeacher && (
                        <Button onClick={onAdd} className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
                            <Plus className="h-4 w-4" /> Add Class
                        </Button>
                    )}
                </div>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Class Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Capacity</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Room No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Class Teacher</th>
                                    {isAdminOrTeacher && <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>}
                                </tr>
                            </thead>
<tbody className="divide-y divide-slate-100">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrTeacher ? 5 : 4} className="py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <School className="h-10 w-10 mb-3 text-slate-300" />
                                                <p className="text-sm text-slate-500">No classes found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((cls) => (
                                        <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {cls.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {cls.capacity || "N/A"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {cls.room_number || "Not assigned"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                                                        {((cls as any).teacher?.full_name?.[0] || 'U')}
                                                    </div>
                                                    <span className="text-slate-700 text-sm">
                                                        {(cls as any).teacher?.full_name || "Not Assigned"}
                                                    </span>
                                                </div>
                                            </td>
                                            {isAdminOrTeacher && (
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-md">
                                                            <DropdownMenuLabel className="text-xs font-medium text-slate-500">Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => onEdit(cls)} className="flex items-center gap-2 cursor-pointer rounded-md">
                                                                <Pencil className="h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onManageSubjects(cls)} className="flex items-center gap-2 cursor-pointer rounded-md">
                                                                <BookOpen className="h-4 w-4" /> Manage Subjects
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => onDelete(cls.id)} className="flex items-center gap-2 cursor-pointer text-red-600 rounded-md">
                                                                <Trash2 className="h-4 w-4" /> Delete
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
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-md">
                    <div className="p-6 border-b bg-slate-50">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">
                                {editingClass ? "Edit Class" : "Add New Class"}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                {editingClass ? "Update class details" : "Create a new class"}
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
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-md">
                    <div className="p-6 border-b bg-slate-50">
                        <DialogTitle className="text-lg font-semibold">Manage Subjects</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Add subjects to <span className="text-blue-600 font-medium">{subjectClass?.name}</span>
                        </DialogDescription>
                    </div>
                    <div className="p-6 space-y-4">
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

                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {classSubjectRecords.length === 0 ? (
                                <div className="border border-dashed border-slate-200 p-8 text-sm text-slate-500 text-center rounded-md">
                                    No subjects assigned yet.
                                </div>
                            ) : (
                                classSubjectRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between border border-slate-200 p-4 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                            {record.subject?.name?.[0] || 'S'}
                                          </div>
                                          <div>
                                              <p className="font-medium text-slate-900">{record.subject?.name}</p>
                                              <p className="text-xs text-slate-500">{record.subject?.code || ""}</p>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-md" onClick={() => handleRemoveSubject(record.id)}>
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
