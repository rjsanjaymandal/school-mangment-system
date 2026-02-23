"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Plus,
  UserPlus,
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

interface StudentListProps {
  initialData: Student[];
}

export function StudentList({ initialData }: StudentListProps) {
  const [data, setData] = useState<Student[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isParentOpen, setIsParentOpen] = useState(false);
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
      <div className="flex justify-end">
        <Button
          onClick={onAdd}
          variant="neon"
          className="rounded-2xl font-bold gap-x-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card
        variant="glass"
        className="p-0 overflow-hidden border-none shadow-xl"
      >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Adm No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {student.admission_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {student.profile?.first_name}{" "}
                        {student.profile?.last_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {student.profile?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{student.class?.name || "N/A"}</TableCell>
                  <TableCell>{student.roll_number || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="futuristic"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-x-2 cursor-pointer">
                          <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(student)}
                          className="gap-x-2 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onLinkParent(student.id)}
                          className="gap-x-2 cursor-pointer"
                        >
                          <UserPlus className="h-4 w-4" /> Link Parent
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-x-2 text-red-600 focus:text-red-700 cursor-pointer">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Make changes to the student record here. Click save when you're done."
                : "Fill in the details below to add a new student to the system."}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            initialData={editingStudent}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isParentOpen} onOpenChange={setIsParentOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Register Parent / Guardian</DialogTitle>
            <DialogDescription>
              Link a guardian profile to this student record.
            </DialogDescription>
          </DialogHeader>
          {linkingStudentId && (
            <ParentForm
              studentId={linkingStudentId}
              onSuccess={() => setIsParentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
