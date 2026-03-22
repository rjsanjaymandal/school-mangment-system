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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="bg-primary text-primary-foreground font-black gap-x-2 emerald-glow uppercase tracking-widest text-[10px] rounded-sm py-2 px-6 h-auto">
          <Plus className="h-4 w-4" />
          Initialize Node
        </Button>
      </div>

      <div className="bg-card/40 backdrop-blur-xl rounded-sm border border-border overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-primary/5 border-b border-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary px-6">ID Code</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Node Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Conceptual Framework</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-right px-6">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No subjects found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((subject) => (
                <TableRow
                  key={subject.id}
                  className="hover:bg-primary/5 transition-colors border-border/50"
                >
                  <TableCell className="px-6">
                    <span className="font-mono text-[10px] font-black px-2 py-1 bg-primary text-primary-foreground rounded-sm emerald-glow-sm">
                      {subject.code || "TBD-00"}
                    </span>
                  </TableCell>
                  <TableCell className="font-black text-foreground uppercase tracking-tight text-xs">
                    {subject.name}
                  </TableCell>
                  <TableCell className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest max-w-xs truncate">
                    {subject.description || "No tactical description"}
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border rounded-sm shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-3">Node Operations</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEdit(subject)}
                          className="gap-x-2 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-primary/10 focus:text-primary px-3 py-2"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Modify Node
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem
                          onClick={() => onDelete(subject.id)}
                          className="gap-x-2 text-red-500 focus:text-red-600 cursor-pointer font-bold uppercase text-[10px] tracking-tight focus:bg-red-500/10 px-3 py-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Terminate Node
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 border-none bg-background/95 backdrop-blur-2xl max-w-md overflow-hidden ring-1 ring-primary/20">
          <div className="bg-primary p-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="font-black text-2xl uppercase tracking-tighter">
                {editingSubject ? "Modify Curriculum Node" : "Initialize Curriculum Node"}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mt-1">
                Academic Framework Configuration
              </p>
            </DialogHeader>
          </div>
          <SubjectForm
            initialData={editingSubject}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

