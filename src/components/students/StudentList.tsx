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
    <div className="space-y-12 page-fade-in">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Total Students", value: initialData.length, icon: Users, color: "blue", sub: "All enrolled students" },
          { label: "Active Students", value: initialData.filter(s => s.admission_number).length, icon: CheckCircle2, color: "emerald", sub: "With admission numbers" },
          { label: "Classes", value: classes.length, icon: Filter, color: "indigo", sub: "Total sections" },
          { label: "Recent Admissions", value: initialData.slice(0, 5).length, icon: Plus, color: "orange", sub: "New enrollments" },
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

      {/* Operations Surface */}
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative flex-1 w-full md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <Input
                    placeholder="Search students by name or ID..."
                    className="h-14 pl-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {isAdmin && (
                     <>
                        <Button
                            onClick={() => setIsBulkImportOpen(true)}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl font-bold transition-all flex items-center gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        >
                            <FileUp className="h-4 w-4" /> Import
                        </Button>
                        <Button
                            onClick={() => setIsBulkAssignOpen(true)}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl font-bold transition-all flex items-center gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            disabled={selectedStudentIds.length === 0}
                        >
                            <Users className="h-4 w-4" /> Bulk Assign ({selectedStudentIds.length})
                        </Button>
                    </>
                )}
            </div>
        </div>

        <Card className="card-premium rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            {isAdmin && <TableHead className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 w-12" />}
                            <TableHead className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Student Profile</TableHead>
                            <TableHead className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Class Node</TableHead>
                            <TableHead className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400">Status</TableHead>
                            <TableHead className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 5 : 4} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <GraduationCap className="h-12 w-12 mb-4 text-slate-200 dark:text-slate-800" />
                                        <p className="text-sm font-medium text-slate-400 italic">No matching student records found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    {isAdmin && (
                                        <TableCell className="py-6 px-10">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                                checked={selectedStudentIds.includes(student.id)}
                                                onChange={() => toggleSelection(student.id)}
                                                aria-label={`Select ${student.profile?.full_name || student.admission_number}`}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <StudentAvatar 
                                                name={student.profile?.full_name} 
                                                classId={student.class_id || ""} 
                                                className="h-11 w-11 text-sm shadow-xl"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white text-base leading-none mb-1 group-hover:text-blue-500 transition-colors">
                                                    {student.profile?.full_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {student.admission_number || "NO-ID"} <span className="mx-1 opacity-30">•</span> ROLL: {student.roll_number || "NA"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-10">
                                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 font-bold">
                                            {student.class?.name || "UNASSIGNED"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-10">
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 font-bold px-3 py-1 rounded-full capitalize">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2" />
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-10 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center rounded-xl">
                                                    <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Entity Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    <Link href={`/students/${student.id}`}>
                                                        <Eye className="h-4 w-4 text-blue-500" /> View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => onEdit(student)}
                                                            className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4 text-indigo-500" /> Edit Credentials
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onLinkParent(student.id)}
                                                            className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <UserPlus className="h-4 w-4 text-emerald-500" /> Link Guardian
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm("Permanently delete this student record? This action cannot be undone.")) {
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
        </Card>
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
