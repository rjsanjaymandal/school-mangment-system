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
    Search
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
        if (!confirm("Are you sure you want to delete this class?")) return;
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search classes..."
                        className="pl-9 h-10 w-full bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isAdminOrTeacher && (
                    <Button onClick={onAdd} className="h-10 px-4 w-full md:w-auto">
                        <Plus className="h-4 w-4 mr-2" /> Add Class
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <School className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{data.length}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{totalCapacity}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <DoorOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Allocated Rooms</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{uniqueRooms}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted">
                        <tr className="border-b border-border">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Capacity</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Room No.</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class Teacher</th>
                            {isAdminOrTeacher && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={isAdminOrTeacher ? 5 : 4} className="h-32 text-center text-muted-foreground">
                                    No classes matched the search criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((cls) => (
                                <tr key={cls.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium text-foreground">
                                        {cls.name}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {cls.capacity || "N/A"}
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {cls.room_number || "Unallocated"}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {(cls as any).teacher?.full_name || "Not Assigned"}
                                    </td>
                                    {isAdminOrTeacher && (
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onEdit(cls)} className="cursor-pointer gap-2">
                                                        <Pencil className="h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onManageSubjects(cls)} className="cursor-pointer gap-2">
                                                        <Plus className="h-4 w-4" /> Manage Subjects
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete(cls.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
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

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px] p-0">
                    <DialogHeader className="p-6 border-b border-border bg-muted/50">
                        <DialogTitle className="text-lg font-semibold text-foreground">
                            {editingClass ? "Edit Class" : "Add Class"}
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            {editingClass ? "Update the class details below." : "Enter the details for the new class."}
                        </DialogDescription>
                    </DialogHeader>
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
                <DialogContent className="sm:max-w-[600px] p-0">
                    <DialogHeader className="p-6 border-b border-border bg-muted/50">
                        <DialogTitle className="text-lg font-semibold text-foreground">Class Subjects</DialogTitle>
                        <DialogDescription className="mt-1">
                            {subjectClass?.name} subject allocations for the active academic year.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                <SelectTrigger>
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
                            <Button onClick={handleAddSubject}>Add Subject</Button>
                        </div>

                        <div className="space-y-3">
                            {classSubjectRecords.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
                                    No subjects assigned yet. Timetable subject selection will stay unrestricted until assignments are added.
                                </div>
                            ) : (
                                classSubjectRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                        <div>
                                            <p className="font-medium text-foreground">{record.subject?.name}</p>
                                            <p className="text-xs text-muted-foreground">{record.subject?.code || "No code"}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveSubject(record.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Remove
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

