"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus, Users } from "lucide-react";
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
import { Class } from "@/types/database";
import { toast } from "sonner";
import { ClassForm } from "./ClassForm";

interface ClassListProps {
  initialData: Class[];
}

export function ClassList({ initialData }: ClassListProps) {
  const [data, setData] = useState<Class[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const onAdd = () => {
    setEditingClass(null);
    setIsOpen(true);
  };

  const onEdit = (cls: Class) => {
    setEditingClass(cls);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-x-2">
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Room Number</TableHead>
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
                  No classes found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((cls) => (
                <TableRow
                  key={cls.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-900">
                    {cls.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-x-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      {cls.capacity || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{cls.room_number || "N/A"}</TableCell>
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
                          onClick={() => onEdit(cls)}
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
              {editingClass ? "Edit Class" : "Add New Class"}
            </DialogTitle>
            <DialogDescription>
              Create or modify class profiles here.
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            initialData={editingClass}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
