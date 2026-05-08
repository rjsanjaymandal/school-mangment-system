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
  GraduationCap
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
  const [capacityInfo, setCapacityInfo] = useState<{ capacity?: number | null; currentCount?: number; available?: number | null } | null>(null);

  const filteredData = initialData.filter(student => 
    student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      
      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: initialData.length, icon: Users, color: "emerald", sub: "All enrolled" },
          { label: "Verified", value: initialData.filter(s => s.admission_number).length, icon: CheckCircle2, color: "blue", sub: "With admission #" },
          { label: "Classes", value: classes.length, icon: Filter, color: "purple", sub: "Total sections" },
          { label: "Unassigned", value: initialData.filter(s => !s.class_id).length, icon: GraduationCap, color: "amber", sub: "No class" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
            <p className="text-[10px] text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name, admission number, or email..."
                    className="h-11 pl-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                     <>
                        <Button
                            onClick={() => setIsBulkImportOpen(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                        >
                            <FileUp className="h-4 w-4 mr-2" /> Import
                        </Button>
                        <Button
                            onClick={() => setIsBulkAssignOpen(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                            disabled={selectedStudentIds.length === 0}
                        >
                            <Users className="h-4 w-4 mr-2" /> Assign ({selectedStudentIds.length})
                        </Button>
                        <Button
                            onClick={onAdd}
                            size="sm"
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Student
                        </Button>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80 border-b border-slate-200">
                            {isAdmin && <TableHead className="w-12" />}
                            <TableHead className="text-sm font-semibold text-slate-600">Student</TableHead>
                            <TableHead className="text-sm font-semibold text-slate-600">Class</TableHead>
                            <TableHead className="text-sm font-semibold text-slate-600">Contact</TableHead>
                            <TableHead className="text-sm font-semibold text-slate-600">Status</TableHead>
                            <TableHead className="text-right text-sm font-semibold text-slate-600">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 6 : 5} className="py-16 text-center">
                                    <div className="flex flex-col items-center">
                                        <GraduationCap className="h-12 w-12 mb-3 text-slate-200" />
                                        <p className="text-sm font-medium text-slate-500">No students found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((student) => (
                                <TableRow key={student.id} className="hover:bg-emerald-50/30 transition-colors group">
                                    {isAdmin && (
                                        <TableCell className="py-4 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                checked={selectedStudentIds.includes(student.id)}
                                                onChange={() => toggleSelection(student.id)}
                                                aria-label={`Select ${student.profile?.full_name || student.admission_number}`}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <StudentAvatar 
                                                name={student.profile?.full_name} 
                                                classId={student.class_id || ""} 
                                                className="h-11 w-11 text-sm ring-2 ring-white shadow-sm"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">
                                                    {student.profile?.full_name}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {student.admission_number || "Pending"} • Roll: {student.roll_number || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-medium">
                                            {student.class?.name || "Unassigned"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-600">{student.profile?.email || "—"}</span>
                                            <span className="text-[10px] text-slate-400">{student.profile?.phone || "No phone"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                            student.admission_number
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                        }`}>
                                            {student.admission_number ? "Enrolled" : "Pending"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 px-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-md">
                                                <DropdownMenuLabel className="text-xs font-medium text-slate-500">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer rounded-md">
                                                    <Link href={`/students/${student.id}`}>
                                                        <Eye className="h-4 w-4" /> View
                                                    </Link>
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => onEdit(student)}
                                                            className="flex items-center gap-2 cursor-pointer rounded-md"
                                                        >
                                                            <Pencil className="h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onLinkParent(student.id)}
                                                            className="flex items-center gap-2 cursor-pointer rounded-md"
                                                        >
                                                            <UserPlus className="h-4 w-4" /> Link Guardian
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm("Delete this student?")) {
                                                                    startTransition(async () => {
                                                                        const res = await deleteStudent(student.id);
                                                                        if (res.error) toast.error(res.error);
                                                                        else toast.success("Student record purged successfully");
                                                                    });
                                                                }
                                                            }}
                                                            className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Purge Record
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
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="p-6 border-b border-border bg-card/50">
            <DialogHeader>
              <DialogTitle className="font-semibold text-xl text-foreground">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                Student configuration and profile details
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4">
            <StudentForm
                initialData={editingStudent}
                classes={classes}
                onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isParentOpen} onOpenChange={setIsParentOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="p-6 border-b border-border bg-card/50">
            <DialogHeader>
              <DialogTitle className="font-semibold text-xl text-foreground text-center">Link Parent/Guardian</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm text-center flex items-center justify-center gap-2">
                  <Activity className="h-4 w-4" /> Manage family contacts
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4">
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
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background border-border shadow-lg">
             <div className="p-6 border-b border-border bg-card/50">
                <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                    <FileUp className="h-5 w-5 text-primary" />
                    Batch Import Students
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">Upload a valid CSV or Excel file to import multiple students.</DialogDescription>
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
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="p-6 border-b border-border bg-card/50">
            <DialogTitle className="text-xl font-semibold text-foreground">Bulk Assign Students</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1 text-sm">
              Assign the selected students to a class and create enrollment records for the active academic year.
            </DialogDescription>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <select
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={selectedClassId}
                onChange={(e) => { void handleClassSelection(e.target.value); }}
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {capacityInfo && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                Capacity: {capacityInfo.capacity ?? "Unlimited"} | Current: {capacityInfo.currentCount ?? 0} | Available: {capacityInfo.available ?? "Unlimited"}
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
              Selected students: {selectedStudentIds.length}
            </div>

            <Button onClick={handleBulkAssign} className="w-full">
              Assign Selected Students
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
