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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Subjects</h3>
        <Button 
          onClick={onAdd} 
          className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? (
          <Card className="col-span-full h-40 flex flex-col items-center justify-center border border-slate-200">
            <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No subjects found</p>
          </Card>
        ) : (
          data.map((subject) => (
            <Card
              key={subject.id}
              className="border-l-4 border-l-emerald-500 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    {subject.code || "N/A"}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-md">
                    <DropdownMenuLabel className="text-xs font-medium text-slate-500">Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onEdit(subject)}
                      className="flex items-center gap-2 cursor-pointer rounded-md"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(subject.id)}
                      className="flex items-center gap-2 cursor-pointer text-red-600 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 mb-3">
                <h4 className="font-medium text-slate-900 text-lg">
                  {subject.name}
                </h4>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {subject.description || "No description"}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Credits</p>
                  <p className="text-lg font-semibold text-slate-900">{subject.credits || 0}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
                    Active
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-md">
          <div className="p-6 border-b bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Create or update a subject
              </DialogDescription>
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