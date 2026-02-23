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

interface SubjectListProps {
  initialData: Subject[];
}

export function SubjectList({ initialData }: SubjectListProps) {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-x-2">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-slate-500"
                >
                  No subjects found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((subject) => (
                <TableRow
                  key={subject.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-semibold px-4 py-1.5 bg-slate-100/50 rounded inline-block mt-2 ml-4">
                    {subject.code || "N/A"}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {subject.name}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                    {subject.description || "N/A"}
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
                        <DropdownMenuItem
                          onClick={() => onEdit(subject)}
                          className="gap-x-2 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-x-2 text-red-600 focus:text-red-700 cursor-pointer">
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
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              Manage details for this academic subject.
            </DialogDescription>
          </DialogHeader>
          <SubjectForm
            initialData={editingSubject}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
