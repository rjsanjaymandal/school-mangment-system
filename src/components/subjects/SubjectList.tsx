"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus, BookOpen } from "lucide-react";
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
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { SubjectForm } from "./SubjectForm";
import { deleteSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubjectListProps {
  initialData: Subject[];
}

export function SubjectList({ initialData }: SubjectListProps) {
  const router = useRouter();
  const [data, setData] = useState<Subject[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const onAdd = () => {
    setEditingSubject(null);
    setIsOpen(true);
  };

  const onEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this curriculum node?")) return;
    const res = await deleteSubject(id);
    if (res.success) {
      toast.success("Curriculum node purged successfully");
      router.refresh();
      setData(data.filter((s) => s.id !== id));
    } else {
      toast.error(res.error || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-12 page-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Curriculum Modules</h3>
        <Button 
          onClick={onAdd} 
          className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold gap-x-2 px-6"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

       <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? (
          <Card className="col-span-full h-80 flex flex-col items-center justify-center card-premium rounded-[2.5rem]">
            <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-sm font-medium text-slate-400 italic">No academic subjects registered in the registry.</p>
          </Card>
        ) : (
          data.map((subject, i) => (
             <Card
              key={subject.id}
              className="card-premium rounded-[2.5rem] p-8 space-y-8 group hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                  <span className="font-bold text-[10px] text-slate-400 tracking-widest uppercase">
                    {subject.code || "NO-CODE"}
                  </span>
                </div>
                
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center rounded-xl">
                      <MoreHorizontal className="h-5 w-5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Entity Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onEdit(subject)}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-bold cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-indigo-500" /> Edit Subject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
                    <DropdownMenuItem
                      onClick={() => onDelete(subject.id)}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Purge Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-2xl tracking-tight leading-tight group-hover:text-blue-500 transition-colors">
                  {subject.name}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                  {subject.description || "Foundational academic subject defining a core segment of the institutional curriculum."}
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{subject.credits || 0}<span className="text-[10px] text-slate-400 ml-1">Credits</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 font-bold px-3 py-1 rounded-full uppercase tracking-widest text-[9px]">
                    Operational
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

       <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background border-slate-200 dark:border-slate-800 shadow-2xl rounded-[2.5rem]">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {editingSubject ? "Modify Curriculum" : "New Curriculum Node"}
              </DialogTitle>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                Define core academic modules and credit weightage for the institutional syllabus.
              </p>
            </DialogHeader>
          </div>
          
           <div className="p-4">
            <SubjectForm
              initialData={editingSubject}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
