"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Calendar, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ExamForm } from "./ExamForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExamListProps {
  initialData: any[];
  academicYears: any[];
}

export function ExamList({ initialData, academicYears }: ExamListProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  const onAdd = () => {
    setEditingExam(null);
    setIsOpen(true);
  };

  const onEdit = (exam: any) => {
    setEditingExam(exam);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-x-2">
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-slate-500 bg-white rounded-xl border border-dashed">
            No exams scheduled.
          </div>
        ) : (
          data.map((exam) => (
            <Card
              key={exam.id}
              className="border-none shadow-sm hover:shadow-md transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(exam)}>
                        Edit Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Cancel Exam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{exam.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {exam.academic_year?.name || "Academic Year"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center text-xs text-slate-400 gap-x-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(exam.start_date).toLocaleDateString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 px-0 group-hover:translate-x-1 transition-transform"
                    asChild
                  >
                    <Link
                      href={`/exams/${exam.id}/marks`}
                      className="flex items-center gap-x-1"
                    >
                      Enter Marks
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? "Edit Exam Schedule" : "Schedule New Exam"}
            </DialogTitle>
            <DialogDescription>
              Manage examination schedules and academic years.
            </DialogDescription>
          </DialogHeader>
          <ExamForm
            initialData={editingExam}
            academicYears={academicYears}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
