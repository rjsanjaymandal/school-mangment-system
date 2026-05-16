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
    ChevronRight,
    Mail,
    Phone,
    LayoutGrid,
    List as ListIcon,
    Download,
    Printer,
    MapPin,
    Calendar,
    Contact2
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
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isDetailed, setIsDetailed] = useState(false);
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
                                placeholder="Search students..."
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
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <Button
                                        variant={viewMode === "table" ? "secondary" : "ghost"}
                                        size="icon"
                                        className={cn(
                                            "h-11 w-11 rounded-none transition-all",
                                            viewMode === "table" ? "bg-slate-900 text-white hover:bg-black" : "text-slate-400 hover:text-slate-900"
                                        )}
                                        onClick={() => setViewMode("table")}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        className={cn(
                                            "h-11 w-11 rounded-none transition-all",
                                            viewMode === "grid" ? "bg-slate-900 text-white hover:bg-black" : "text-slate-400 hover:text-slate-900"
                                        )}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-11 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            <Download className="h-4 w-4 mr-2" /> Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl border-none">
                                        <DropdownMenuItem className="rounded-lg gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50">
                                            <Printer className="h-4 w-4 text-slate-400" /> Export PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50">
                                            <FileUp className="h-4 w-4 text-emerald-500" /> Export Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

            <ERPCard
                title={viewMode === "table" ? "Student List" : "Student List"}
                description={viewMode === "table" ? "List of all registered students" : "Visual roster of students"}
                icon={viewMode === "table" ? <GraduationCap className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                color="emerald"
                className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
            >
                {viewMode === "table" ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {isAdmin && <TableHead className="w-12 px-6" />}
                                    <TableHead className="px-6 py-4">Student</TableHead>
                                    <TableHead className="px-6 py-4">Class</TableHead>
                                    <TableHead className="px-6 py-4">Contacts</TableHead>
                                    <TableHead className="px-6 py-4 text-center">Status</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 6 : 5} className="py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                                    <GraduationCap className="h-12 w-12 text-slate-200" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No students found</p>
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
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 group/contact cursor-default">
                                                        <Mail className="h-3 w-3 text-slate-400 group-hover/contact:text-emerald-500 transition-colors" />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{student.profile?.email || "No email"}</span>
                                                    </div>
                                                    {(student.profile?.phone || (student as any).guardian_students?.[0]?.guardian?.phone) && (
                                                        <div className="flex items-center gap-1.5 group/contact cursor-default">
                                                            <Phone className="h-3 w-3 text-slate-400 group-hover/contact:text-blue-500 transition-colors" />
                                                            <div className="flex flex-col">
                                                                {student.profile?.phone && (
                                                                    <span className="text-[10px] font-bold text-slate-600">{student.profile.phone}</span>
                                                                )}
                                                                {(student as any).guardian_students?.[0]?.guardian?.phone && (
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">G: {(student as any).guardian_students[0].guardian.phone}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
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
                                                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                                                            <Link href={`/students/${student.id}`}>
                                                                <Eye className="h-4 w-4" /> View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => onEdit(student)}
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <Pencil className="h-4 w-4" /> Edit Student
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
                                                                        if (confirm("Delete student record? This action is irreversible.")) {
                                                                            startTransition(async () => {
                                                                                const res = await deleteStudent(student.id);
                                                                                if (res.error) toast.error(res.error);
                                                                                else toast.success("Record Deleted");
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Delete Student
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
                ) : (
                    <div className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {paginatedData.map(student => (
                                <div 
                                    key={student.id}
                                    className={cn(
                                        "group relative p-6 rounded-3xl border-2 text-left transition-all duration-500 bg-white/50 backdrop-blur-sm",
                                        selectedStudentIds.includes(student.id) ? "border-emerald-500 bg-emerald-500/5 shadow-lg" : "border-slate-100 hover:border-emerald-500/30"
                                    )}
                                >
                                    <div className="absolute top-4 right-4 z-10">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudentIds.includes(student.id)} 
                                            onChange={() => toggleSelection(student.id)} 
                                            className="h-5 w-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-2xl bg-white p-1 border border-slate-100 shadow-sm group-hover:rotate-3 transition-transform">
                                                <StudentAvatar 
                                                    name={student.profile?.full_name || undefined} 
                                                    className="w-full h-full rounded-xl" 
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 w-full">
                                            <h4 className="font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                                                {student.profile?.full_name}
                                            </h4>
                                            <p className="text-[10px] font-black text-slate-400 font-mono tracking-widest mt-1 uppercase">
                                                {student.admission_number || "PENDING"}
                                            </p>

                                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                                <Badge className="bg-slate-900 text-white border-none text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full">
                                                    {student.class?.name || "N/A"}
                                                </Badge>
                                                <Badge className={cn(
                                                    "border-none text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full",
                                                    student.admission_number ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {student.admission_number ? "ENROLLED" : "PENDING"}
                                                </Badge>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    asChild
                                                    className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all"
                                                >
                                                    <Link href={`/students/${student.id}`}>Profile</Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-400">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl border-none">
                                                        <DropdownMenuItem onClick={() => onEdit(student)} className="rounded-lg gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50">
                                                            <Pencil className="h-4 w-4 text-amber-500" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50">
                                                            <Printer className="h-4 w-4 text-slate-400" /> Print ID
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <UnifiedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(size) => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                    }}
                    itemName="students"
                />
            </ERPCard>

            {/* Dialogs */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <DialogHeader>
                            <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">
                                {editingStudent ? "Edit Student" : "Add Student"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                                Manage student profile and enrollment
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
