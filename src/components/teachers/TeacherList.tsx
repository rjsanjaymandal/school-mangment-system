"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, Plus } from "lucide-react";
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

interface TeacherListProps {
  initialData: Teacher[];
}

export function TeacherList({ initialData }: TeacherListProps) {
  const [data, setData] = useState<Teacher[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={onAdd}
          variant="neon"
          className="rounded-2xl font-bold gap-x-2"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Card
        variant="glass"
        className="p-0 overflow-hidden border-none shadow-xl"
      >
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px]">Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  No teachers found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {teacher.employee_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {teacher.profile?.first_name}{" "}
                        {teacher.profile?.last_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {teacher.profile?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.specialization?.map((spec) => (
                        <Badge key={spec} variant="futuristic">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="futuristic"
                      className={
                        teacher.status === "active"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }
                    >
                      {teacher.status || "Active"}
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
                          onClick={() => onEdit(teacher)}
                          className="gap-x-2 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(teacher.id)}
                          className="gap-x-2 text-red-600 focus:text-red-700 cursor-pointer"
                        >
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
              {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
            </DialogTitle>
            <DialogDescription>
              {editingTeacher
                ? "Make changes to the teacher's profile and record. Click save when you're done."
                : "Fill in the details below to add a new teacher to the faculty."}
            </DialogDescription>
          </DialogHeader>
          <TeacherForm
            initialData={editingTeacher}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher's
              profile and all associated academic records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

