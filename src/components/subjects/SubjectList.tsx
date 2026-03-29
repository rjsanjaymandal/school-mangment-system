"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus, BookOpen } from "lucide-react";
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
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { SubjectForm } from "./SubjectForm";
import { deleteSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";

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
      toast.success("Subject deleted successfully");
      router.refresh();
      setData(data.filter((s) => s.id !== id));
    } else {
      toast.error(res.error || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in transition-all duration-700 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8 relative z-10">
        <div className="flex items-center gap-x-6">
          <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Subject Registry</h1>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Core Academic Curriculum
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onAdd} 
          className="h-11 px-8 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-all shadow-md flex items-center gap-3 uppercase tracking-wider text-[11px]"
        >
          <Plus className="h-4 w-4" /> Add New Subject
        </Button>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 reveal-2 relative z-10">
        {data.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-muted/5 border border-dashed border-border rounded-xl">
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest italic">No subject records found</p>
          </div>
        ) : (
          data.map((subject, i) => (
             <div
              key={subject.id}
              className="group relative transition-all duration-300 hover:shadow-md rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="relative">
                <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-bold text-[11px] text-muted-foreground tracking-wider uppercase">
                      {subject.code || `SUB-${subject.id.slice(0, 4).toUpperCase()}`}
                    </span>
                  </div>
                  
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-1 border border-border shadow-xl rounded-lg">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-2">Subject Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem
                        onClick={() => onEdit(subject)}
                        className="gap-x-3 cursor-pointer font-bold uppercase text-[10px] tracking-wide py-2 px-3 rounded-md focus:bg-primary/10 focus:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit Subject
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(subject.id)}
                        className="gap-x-3 text-destructive focus:text-destructive cursor-pointer font-bold uppercase text-[10px] tracking-wide py-2 px-3 rounded-md focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Subject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground text-xl tracking-tight">
                      {subject.name}
                    </h4>
                    <p className="text-[12px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                      {subject.description || "Core academic subject focused on providing comprehensive foundational knowledge in the designated field."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 border border-border rounded-lg">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Credits</p>
                      <p className="text-2xl font-bold text-primary tabular-nums">{subject.credits || 0}<span className="text-[10px] lowercase text-muted-foreground/60 ml-1 font-semibold">pts</span></p>
                    </div>
                    <div className="p-4 bg-muted/20 border border-border rounded-lg">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

       <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 border-none rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-primary/5 border-b border-border p-10 text-center">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                {editingSubject ? "Update Subject" : "Create New Subject"}
              </DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-3 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-border" /> Curriculum Definition <span className="h-px w-8 bg-border" />
              </p>
            </DialogHeader>
          </div>
          
           <div className="p-2">
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
