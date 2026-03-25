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

interface StudentListProps {
  initialData: Student[];
  userRole?: string | null;
}

export function StudentList({ initialData, userRole }: StudentListProps) {
  const isAdmin = userRole === "admin";
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);

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
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="ghost"
            className="rounded-sm border border-border bg-card/40 backdrop-blur-md font-bold gap-x-2 text-foreground/80 hover:text-primary transition-all shadow-xl"
          >
            <FileUp className="h-4 w-4" />
            Bulk Import CSV
          </Button>
          <Button
            onClick={onAdd}
            className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[180px] uppercase tracking-widest text-[10px]"
          >
            <Plus className="h-4 w-4" />
            Initialize Student
          </Button>
        </div>
      )}

      <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[140px] p-5 font-black uppercase tracking-widest text-[10px] text-primary">Registry ID</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Identity</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Formation</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Sequential ID</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Status</TableHead>
              <TableHead className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-primary">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-primary/5 transition-colors border-border/50"
                >
                  <TableCell className="p-5 font-black text-foreground transition-colors group-hover:text-primary font-mono text-xs uppercase">
                    {student.admission_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-foreground uppercase tracking-tight text-xs">
                        {student.profile?.first_name}{" "}
                        {student.profile?.last_name}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                        {student.profile?.email || "NO-EMAIL-NODATA"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-foreground uppercase tracking-tighter text-xs">
                    {student.class?.name || "UNASSIGNED"}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] font-black opacity-60">
                    #{student.roll_number || "00"}
                  </TableCell>
                  <TableCell className="p-5">
                    <Badge
                      className="bg-primary/10 text-primary border border-primary/20 emerald-glow-sm text-[9px] font-black px-3 py-0.5 rounded-sm uppercase tracking-[0.2em]"
                    >
                      Operational
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right p-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border rounded-sm shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-3">Registry Operations</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2">
                          <Link href={`/students/${student.id}`}>
                            <Eye className="h-3.5 w-3.5" /> View Identity
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => onEdit(student)}
                            className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Modify Profile
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onLinkParent(student.id)}
                              className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2"
                            >
                              <UserPlus className="h-3.5 w-3.5" /> Link Guardian
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Terminate this student registry?")) {
                                  startTransition(async () => {
                                    const res = await deleteStudent(student.id);
                                    if (res.error) toast.error(res.error);
                                    else toast.success("Registry terminated successfully");
                                  });
                                }
                              }}
                              className="gap-x-2 text-red-500 focus:text-red-600 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-red-500/10 px-3 py-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Terminate Node
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
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-xl overflow-hidden ring-1 ring-primary/20">
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl uppercase tracking-tighter">
                {editingStudent ? "Modify Student Profile" : "Initialize Student Node"}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mt-1">
                Institutional Registry Configuration
              </p>
            </DialogHeader>
          </div>
          <StudentForm
            initialData={editingStudent}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isParentOpen} onOpenChange={setIsParentOpen}>
        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-lg overflow-hidden ring-1 ring-primary/20">
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl uppercase tracking-tighter text-center">Initialize Guardian Node</DialogTitle>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest text-center mt-1">Registry Liaison Management</p>
            </DialogHeader>
          </div>
          <div className="p-2">
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
        <DialogContent className="sm:max-w-[600px] glass border-white/20">
          <BulkImportModal
            onSuccess={() => setIsBulkImportOpen(false)}
            onCancel={() => setIsBulkImportOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

