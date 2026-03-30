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
import { deleteStudent } from "@/app/actions/students";
import { toast } from "sonner";
import { BulkImportModal } from "./BulkImportModal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StudentListProps {
  initialData: Student[];
  classes: any[];
  userRole?: string | null;
}

export function StudentList({ initialData, classes, userRole }: StudentListProps) {
  const isAdmin = userRole === "admin";
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 reveal-2 relative z-10">
        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-20 w-20 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Students</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{initialData.length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <Activity className="h-3.5 w-3.5" /> All enrolled students
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle2 className="h-20 w-20 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Active Students</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">
                {initialData.filter(s => s.admission_number).length.toString().padStart(2, '0')}
            </h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> With admission numbers
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-medium text-muted-foreground mb-2">Classes</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{classes.length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <Filter className="h-3.5 w-3.5 text-blue-500" /> Total sections
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
             <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ArrowUpRight className="h-20 w-20 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Admissions</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">
                 {initialData.slice(0, 5).length.toString().padStart(2, '0')}
            </h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <Plus className="h-3.5 w-3.5" /> New enrollments
            </p>
        </div>
      </div>

      {/* Operations Surface */}
      <div className="space-y-8 relative z-10 animate-in slide-in-from-bottom-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 border border-border bg-card/40 backdrop-blur-sm rounded-sm">
            <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                    placeholder="Search students..."
                    className="h-11 pl-12 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40 transition-all"
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
                            className="h-11 px-6 font-medium transition-all flex items-center gap-2"
                        >
                            <FileUp className="h-4 w-4" /> Batch Import
                        </Button>
                        <Button
                            onClick={onAdd}
                            className="h-11 px-6 font-medium transition-all flex items-center gap-2"
                        >
                            <UserPlus className="h-4 w-4" /> Add Student
                        </Button>
                    </>
                )}
            </div>
        </div>

        <div className="border border-border bg-card/40 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 px-6 font-semibold">Student Profile</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Class</TableHead>
                            <TableHead className="py-4 px-6 font-semibold">Status</TableHead>
                            <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <GraduationCap className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
                                        <p className="text-sm font-medium text-muted-foreground">No students found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((student) => (
                                <TableRow key={student.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-full bg-primary/20 border border-primary/20">
                                                {student.profile?.full_name?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-none mb-1">
                                                    {student.profile?.full_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    Adm: {student.admission_number || "N/A"} <span className="mx-1">•</span> Roll: {student.roll_number || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-foreground">{student.class?.name || "Unassigned"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 px-6">
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium px-3 py-1 rounded-full capitalize">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted transition-colors flex items-center justify-center rounded-sm">
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-sm border border-border shadow-md">
                                                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Manage Student</DropdownMenuLabel>
                                                <DropdownMenuItem asChild className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-muted focus:bg-muted transition-colors">
                                                    <Link href={`/students/${student.id}`}>
                                                        <Eye className="h-4 w-4" /> View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => onEdit(student)}
                                                            className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-muted focus:bg-muted transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4" /> Edit Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => onLinkParent(student.id)}
                                                            className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-muted focus:bg-muted transition-colors"
                                                        >
                                                            <UserPlus className="h-4 w-4" /> Link Parent/Guardian
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (confirm("Delete this student record?")) {
                                                                    startTransition(async () => {
                                                                        const res = await deleteStudent(student.id);
                                                                        if (res.error) toast.error(res.error);
                                                                        else toast.success("Student deleted successfully");
                                                                    });
                                                                }
                                                            }}
                                                            className="flex items-center gap-3 px-2 py-2 text-sm text-red-500 cursor-pointer rounded-sm hover:text-red-600 focus:text-red-600 focus:bg-red-50 transition-colors"
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
    </div>
  );
}
