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
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const res = await deleteSubject(id);
    if (res.success) {
      toast.success("Subject deleted");
      router.refresh();
      setData(data.filter((s) => s.id !== id));
    } else {
      toast.error(String(res.error) || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Subject Directory</h3>
        <Button 
          onClick={onAdd} 
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] gap-2 px-6 h-12 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.length === 0 ? (
          <div className="col-span-full p-24 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem]">
            <BookOpen className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No subjects found</p>
          </div>
        ) : (
          data.map((subject, idx) => (
            <div
              key={subject.id}
              className="group relative flex flex-col p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="h-12 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black text-sm tracking-widest shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                  {subject.code || "N/A"}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl border-slate-200/60 shadow-xl overflow-hidden p-1">
                    <DropdownMenuLabel className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 px-3 py-2">Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onEdit(subject)}
                      className="flex items-center gap-3 cursor-pointer rounded-xl font-bold text-xs text-slate-600 focus:bg-slate-50 focus:text-indigo-600 p-3"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem
                      onClick={() => onDelete(subject.id)}
                      className="flex items-center gap-3 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-xl font-bold text-xs p-3"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4 relative z-10 flex-1">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {subject.name}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {subject.description || "No description provided for this subject."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-700">
                     {subject.credits || 0} <span className="text-[10px] text-slate-400">PTS</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-widest text-[9px] font-bold px-3 py-1 rounded-lg">
                  Active
                </Badge>
              </div>

              {/* Decorative Bottom Bar */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-500 group-hover:w-full transition-all duration-700 delay-100" />
            </div>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Create or update a subject
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 bg-white/30 dark:bg-slate-900/30">
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