"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Plus,
    UserPlus,
    FileUp,
    Users,
    Search,
    CheckCircle2,
    TrendingUp,
    Activity,
    Filter,
    ArrowUpRight,
    GraduationCap,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Student } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ParentForm } from "../parents/ParentForm";
import { StudentForm } from "./StudentForm";
import { Card } from "@/components/ui/card";
import { StudentAvatar } from "./StudentAvatar";
import { bulkAssignStudentsToClass, deleteStudent, getClassCapacity } from "@/app/actions/students";
import { toast } from "sonner";
import { BulkImportModal } from "./BulkImportModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";

// Shared UI Framework
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";

interface StudentListProps {
    initialData: Student[];
    classes: any[];
    userRole?: string | null;
    currentAcademicYearId?: string;
}

export function StudentList({ initialData, classes, userRole, currentAcademicYearId }: StudentListProps) {
    const isAdmin = userRole === "admin";
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isParentOpen, setIsParentOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [capacityInfo, setCapacityInfo] = useState<{ capacity?: number | null; currentCount?: number; available?: number | null } | null>(null);

    const filteredData = initialData.filter(student => {
        const matchesSearch = 
            student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === "all" || student.class_id === classFilter;
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "enrolled" && student.admission_number) ||
            (statusFilter === "pending" && !student.admission_number);
        return matchesSearch && matchesClass && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const onAdd = () => {
        setEditingStudent(null);
        setIsOpen(true);
    };

    const onEdit = (student: Student) => {
        setEditingStudent(student);
        setIsOpen(true);
    };

    const onLinkParent = (studentId: string) => {
        setLinkingStudentId(studentId);
        setIsParentOpen(true);
    };

    const toggleSelection = (studentId: string) => {
        setSelectedStudentIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
    };

    const handleClassSelection = async (classId: string) => {
        setSelectedClassId(classId);
        if (!classId) {
            setCapacityInfo(null);
            return;
        }

        const result = await getClassCapacity(classId);
        if (result.success) {
            setCapacityInfo({
                capacity: result.capacity,
                currentCount: result.currentCount,
                available: result.available,
            });
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedClassId || selectedStudentIds.length === 0) {
            toast.error("Select at least one student and a class.");
            return;
        }

        const result = await bulkAssignStudentsToClass(selectedStudentIds, selectedClassId, currentAcademicYearId);
        if (!result.success) {
            toast.error(result.error || "Failed to assign students");
            return;
        }

        toast.success(`${result.assignedCount || selectedStudentIds.length} students assigned successfully`);
        setSelectedStudentIds([]);
        setSelectedClassId("");
        setIsBulkAssignOpen(false);
    };

    return (
        <div className="space-y-8">
            {/* Unified Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard 
                    title="Total Enrollment" 
                    value={initialData.length} 
                    icon={Users} 
                    color="emerald" 
                    description="Verified Students" 
                />
                <DashboardStatCard 
                    title="Verified" 
                    value={initialData.filter(s => s.admission_number).length} 
                    icon={CheckCircle2} 
                    color="blue" 
                    description="With ID Number" 
                />
                <DashboardStatCard 
                    title="Classes" 
                    value={classes.length} 
                    icon={Filter} 
                    color="purple" 
                    description="Active Sections" 
                />
                <DashboardStatCard 
                    title="Unassigned" 
                    value={initialData.filter(s => !s.class_id).length} 
                    icon={GraduationCap} 
                    color="amber" 
                    description="Awaiting Placement" 
                />
            </div>

            {/* Unified Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-1 flex-col lg:flex-row gap-4 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search student directory..."
                                className="h-11 pl-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 text-xs font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 text-xs font-bold">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id} className="rounded-lg">{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-11 w-[140px] rounded-xl border-slate-200 text-xs font-bold">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {isAdmin && (
                             <>
                                <Button
                                    onClick={() => setIsBulkImportOpen(true)}
                                    variant="outline"
                                    className="h-11 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                >
                                    <FileUp className="h-4 w-4 mr-2" /> Import
                                </Button>
                                <Button
                                    onClick={() => setIsBulkAssignOpen(true)}
                                    variant="outline"
                                    className="h-11 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-50"
                                    disabled={selectedStudentIds.length === 0}
                                >
                                    <Users className="h-4 w-4 mr-2" /> Assign ({selectedStudentIds.length})
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Unified Table View */}
            <ERPCard
                title="Student Directory"
                description="Verified list of institutional members"
                icon={<GraduationCap className="h-5 w-5" />}
                color="emerald"
                className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {isAdmin && <TableHead className="w-12 px-6" />}
                                <TableHead className="px-6 py-4">Identity</TableHead>
                                <TableHead className="px-6 py-4">Academic Group</TableHead>
                                <TableHead className="px-6 py-4">Connectivity</TableHead>
                                <TableHead className="px-6 py-4 text-center">Status</TableHead>
                                <TableHead className="px-6 py-4 text-right">Operations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-6 bg-slate-50 rounded-full mb-4">
                                                <GraduationCap className="h-12 w-12 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Records Discovered</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-slate-50/50 transition-all group">
                                        {isAdmin && (
                                            <TableCell className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded-lg border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer transition-all"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => toggleSelection(student.id)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <StudentAvatar 
                                                    name={student.profile?.full_name || undefined} 
                                                    classId={student.class_id || ""} 
                                                    className="h-11 w-11 rounded-xl ring-2 ring-white shadow-md border-2 border-slate-50"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm tracking-tight">
                                                        {student.profile?.full_name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                        {student.admission_number || "Pending"} • Roll: {student.roll_number || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                                {student.class?.name || "Unassigned"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-600">{student.profile?.email || "—"}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{student.profile?.phone || "No phone"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border",
                                                student.admission_number
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {student.admission_number ? "Enrolled" : "Pending"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-slate-200/60 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Operations</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                                                        <Link href={`/students/${student.id}`}>
                                                            <Eye className="h-4 w-4" /> Profile View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {isAdmin && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => onEdit(student)}
                                                                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <Pencil className="h-4 w-4" /> Modify Records
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onLinkParent(student.id)}
                                                                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <UserPlus className="h-4 w-4" /> Link Guardian
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (confirm("Purge student record? This action is irreversible.")) {
                                                                        startTransition(async () => {
                                                                            const res = await deleteStudent(student.id);
                                                                            // @ts-expect-error - res.error may exist
                                                                            if (res.error) toast.error(res.error);
                                                                            else toast.success("Record Purged");
                                                                        });
                                                                    }
                                                                }}
                                                                className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Purge Records
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </ERPCard>
            
            {/* Unified Pagination Framework */}
            <UnifiedPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                itemName="students"
            />

            {/* Dialogs - Kept as is but can be updated later */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogHeader>
                            <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">
                                {editingStudent ? "Modify Identity" : "Enroll Member"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                                Global institutional membership configuration
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        <StudentForm
                            initialData={editingStudent}
                            classes={classes}
                            onSuccess={() => setIsOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isParentOpen} onOpenChange={setIsParentOpen}>
                <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogHeader>
                            <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight text-center">Link Guardian</DialogTitle>
                            <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                <Activity className="h-4 w-4" /> Family connectivity framework
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        {linkingStudentId && (
                            <ParentForm
                                studentId={linkingStudentId}
                                onSuccess={() => setIsParentOpen(false)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <FileUp className="h-6 w-6 text-emerald-600" />
                            Batch Import
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Upload institutional data in bulk format</DialogDescription>
                    </div>
                    <div className="p-8">
                        <BulkImportModal
                            onSuccess={() => setIsBulkImportOpen(false)}
                            onCancel={() => setIsBulkImportOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
                <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Bulk Assignment</DialogTitle>
                        <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                            Global class allocation framework
                        </DialogDescription>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</Label>
                            <select
                                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold"
                                value={selectedClassId}
                                onChange={(e) => { void handleClassSelection(e.target.value); }}
                            >
                                <option value="">Select allocation target</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Selection</p>
                            <p className="text-lg font-bold text-slate-900">{selectedStudentIds.length} members selected</p>
                        </div>

                        <Button onClick={handleBulkAssign} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black font-black text-[10px] uppercase tracking-widest text-white shadow-xl">
                            Execute Assignment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
