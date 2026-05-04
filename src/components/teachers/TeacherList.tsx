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
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2 px-6"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      <Card className="card-premium rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-left">Employee ID</th>
              <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-left">Teacher Name</th>
              <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-left">Specialization</th>
              <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-left">Status</th>
              <th className="py-5 px-10 font-bold uppercase tracking-widest text-[10px] text-slate-400 text-right">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-20 text-center text-slate-400 font-medium italic"
                >
                  No faculty records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="py-6 px-10 font-bold text-slate-900 dark:text-white font-mono text-xs">
                    {teacher.employee_id}
                  </td>
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center font-bold text-slate-900 dark:text-white text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {teacher.profile?.full_name?.[0] || 'T'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-base leading-none mb-1 group-hover:text-blue-500 transition-colors">
                          {teacher.profile?.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {teacher.profile?.email || "NO-EMAIL"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-10">
                    <div className="flex flex-wrap gap-2">
                      {teacher.specialization?.map((spec) => (
                        <Badge key={spec} variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900 font-bold text-[9px] px-2 py-0.5 rounded-lg uppercase">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-6 px-10">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider",
                        teacher.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900"
                      )}
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full mr-2", teacher.status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                      {teacher.status || "Operational"}
                    </Badge>
                  </td>
                  <td className="py-6 px-10 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center rounded-xl">
                          <MoreHorizontal className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Entity Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Link href={`/teachers/${teacher.id}`}>
                            <Eye className="h-4 w-4 text-blue-500" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(teacher)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-indigo-500" /> Edit Credentials
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(teacher.id)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Purge Record
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
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem]">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                {editingTeacher ? "Edit Faculty Profile" : "Add New Faculty"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Configure faculty credentials and institutional access details.
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
        <AlertDialogContent className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-2xl text-red-500 tracking-tight">Purge Faculty Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
              This action will permanently remove the faculty record and all associated data from the institutional neural library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200 dark:border-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold px-8"
            >
              {isPending ? "Purging..." : "Confirm Purge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem]">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
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
