"use client";

import { useState, useTransition } from "react";
import { 
    MoreHorizontal, Pencil, Trash2, Eye, Plus, FileUp, 
    Mail, Phone, Users, GraduationCap, Search, Activity
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
import { ERPCard } from "@/components/ui/erp-card";
import { BulkImportTeacherModal } from "./BulkImportTeacherModal";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";
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
  
  // Pagination & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const filteredData = data.filter(teacher => 
    teacher.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search faculty..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-11 h-12 rounded-2xl bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm font-bold text-xs"
            />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="flex-1 md:flex-none h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            onClick={onAdd}
            className="flex-1 md:flex-none h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      <ERPCard
        title="Faculty Directory"
        description="List of all registered teachers and staff"
        icon={<Users className="h-5 w-5" />}
        color="blue"
        className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <TableHead className="px-6 py-4">Teacher Name</TableHead>
                <TableHead className="px-6 py-4">Specialization</TableHead>
                <TableHead className="px-6 py-4">Contacts</TableHead>
                <TableHead className="px-6 py-4 text-center">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center">
                        <Activity className="h-10 w-10 text-slate-200 mb-3" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No faculty records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-slate-50/50 transition-all group">
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-black text-sm shadow-sm">
                          {teacher.profile?.full_name?.[0] || 'T'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm tracking-tight">
                            {teacher.profile?.full_name}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter uppercase">
                            ID: {teacher.employee_id || "SYS-000"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(teacher.specialization) ? teacher.specialization : []).map((spec: string) => (
                          <Badge key={spec} variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-black uppercase tracking-tighter rounded-md">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 group/contact cursor-default">
                                <Mail className="h-3 w-3 text-slate-400 group-hover/contact:text-emerald-500 transition-colors" />
                                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{teacher.profile?.email || "No email"}</span>
                            </div>
                            {teacher.profile?.phone && (
                                <div className="flex items-center gap-1.5 group/contact cursor-default">
                                    <Phone className="h-3 w-3 text-slate-400 group-hover/contact:text-blue-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-600">{teacher.profile.phone}</span>
                                </div>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border inline-flex items-center gap-1.5",
                        teacher.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        <div className={cn("h-1.5 w-1.5 rounded-full", teacher.status === "active" ? "bg-emerald-500" : "bg-rose-500")} />
                        {teacher.status || "Operational"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-slate-200/60 backdrop-blur-xl bg-white/95">
                          <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                            <Link href={`/teachers/${teacher.id}`}>
                              <Eye className="h-4 w-4 text-blue-500" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit(teacher)}
                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-amber-500" /> Edit Faculty
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 bg-slate-100" />
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(teacher.id)}
                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Unified Pagination Framework */}
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
            itemName="teachers"
          />
      </ERPCard>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">
                Configure faculty profile and details
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            <TeacherForm
              initialData={editingTeacher}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl text-slate-900">Delete Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 font-bold">
              This action will permanently remove the teacher record from the institutional ledger. This is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100"
            >
              {isPending ? "Processing..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl rounded-3xl backdrop-blur-xl">
           <div className="p-8 border-b border-slate-100 bg-slate-50/50">
             <DialogTitle className="font-black text-2xl text-slate-900 tracking-tight">Batch Import Faculty</DialogTitle>
             <DialogDescription className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Upload a valid CSV file to import multiple faculty members</DialogDescription>
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

import { Input } from "@/components/ui/input";
