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
    <div className="space-y-4">
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => setIsBulkImportOpen(true)}
          variant="ghost"
          className="rounded-sm border border-border bg-card/40 backdrop-blur-md font-bold gap-x-2 text-foreground/80 hover:text-primary transition-all shadow-xl"
        >
          <FileUp className="h-4 w-4" />
          Import Teachers
        </Button>
        <Button
          onClick={onAdd}
          className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[180px] uppercase tracking-widest text-[10px]"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[180px] p-5 font-black uppercase tracking-widest text-[10px] text-primary">Employee ID</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Teacher Name</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Specialization</TableHead>
              <TableHead className="p-5 font-black uppercase tracking-widest text-[10px] text-primary">Status</TableHead>
              <TableHead className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No teachers found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-primary/5 transition-colors border-border/50"
                >
                  <TableCell className="p-5 font-black text-foreground transition-colors group-hover:text-primary font-mono text-xs uppercase">
                    {teacher.employee_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-foreground uppercase tracking-tight text-xs">
                        {teacher.profile?.first_name}{" "}
                        {teacher.profile?.last_name}
                      </span>
                      <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                        {teacher.profile?.email || "NO-EMAIL-NODATA"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.specialization?.map((spec) => (
                        <Badge key={spec} className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="p-5">
                    <Badge
                      className={cn(
                        "text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg",
                        teacher.status === "active"
                          ? "bg-primary/10 text-primary border border-primary/20 emerald-glow-sm"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}
                    >
                      {teacher.status || "Operational"}
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
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-3">Teacher Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2">
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(teacher)}
                          className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit Teacher
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(teacher.id)}
                          className="gap-x-2 text-red-500 focus:text-red-600 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-red-500/10 px-3 py-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Teacher
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
        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-xl overflow-hidden ring-1 ring-primary/20">
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl uppercase tracking-tighter">
                {editingTeacher ? "Edit Teacher Profile" : "Add New Teacher"}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mt-1">
                Teacher Information Setup
              </p>
            </DialogHeader>
          </div>
          <TeacherForm
            initialData={editingTeacher}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-sm border-border bg-card/95 backdrop-blur-2xl shadow-2xl ring-1 ring-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-500 text-xl">Delete Teacher Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
              The teacher&apos;s record and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm font-black uppercase tracking-widest text-[10px] border-border bg-transparent hover:bg-foreground/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-sm font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20"
            >
              {isPending ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-[600px] glass border-white/20">
          <BulkImportTeacherModal
            onSuccess={() => setIsBulkImportOpen(false)}
            onCancel={() => setIsBulkImportOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


