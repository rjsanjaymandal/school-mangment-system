"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, Plus, FileUp } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/types/database";
import { deleteTeacher } from "@/app/actions/teachers";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { TeacherForm } from "./TeacherForm";
import { Card } from "@/components/ui/card";
import { BulkImportTeacherModal } from "./BulkImportTeacherModal";
import Link from "next/link";

interface TeacherListProps {
  initialData: Teacher[];
}

export function TeacherList({ initialData }: TeacherListProps) {
  const [data, setData] = useState<Teacher[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onAdd = () => {
    setEditingTeacher(null);
    setIsOpen(true);
  };

  const onEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsOpen(true);
  };

  const onDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteTeacher(deleteId);
      if (result.success) {
        toast.success("Teacher record deleted");
        setData((prevData) => prevData.filter((teacher) => teacher.id !== deleteId));
      } else {
        toast.error(result.error || "Failed to delete teacher");
      }
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-8 page-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Faculty Directory</h3>
        <div className="flex gap-4">
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold gap-x-2 transition-all shadow-sm"
          >
            <FileUp className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={onAdd}
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b">
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Employee ID</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Teacher Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Specialization</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Status</th>
              <th className="py-3 px-4 text-right text-sm font-medium text-slate-600">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-slate-500"
                >
                  No teachers found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-sm text-slate-600">
                    {teacher.employee_id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
                        {teacher.profile?.full_name?.[0] || 'T'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {teacher.profile?.full_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {teacher.profile?.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {/* @ts-expect-error - specialization can be string or array */}
                      {teacher.specialization?.map((spec: string) => (
                        <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        teacher.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full mr-2", teacher.status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                      {teacher.status || "Operational"}
                    </Badge>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-md">
                        <DropdownMenuLabel className="text-xs font-medium text-slate-500">Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer rounded-md">
                          <Link href={`/teachers/${teacher.id}`}>
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(teacher)}
                          className="flex items-center gap-2 cursor-pointer rounded-md"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(teacher.id)}
                          className="flex items-center gap-2 cursor-pointer text-red-600 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-md">
          <div className="p-6 border-b bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Configure teacher details
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4">
            <TeacherForm
              initialData={editingTeacher}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              This action will permanently remove the teacher record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-md">
           <div className="p-6 border-b bg-slate-50">
             <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Batch Import Faculty</DialogTitle>
             <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Upload a valid CSV file to import multiple faculty members simultaneously.</DialogDescription>
           </div>
           <div className="p-8">
            <BulkImportTeacherModal
              onSuccess={() => setIsBulkImportOpen(false)}
              onCancel={() => setIsBulkImportOpen(false)}
            />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
