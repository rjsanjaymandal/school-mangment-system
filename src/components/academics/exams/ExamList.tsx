"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ExamForm } from "./ExamForm";

interface ExamListProps {
  initialData: any[];
  academicYears: any[];
}

export function ExamList({ initialData, academicYears }: ExamListProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const onAdd = () => {
    setEditingExam(null);
    setIsOpen(true);
  };

  const onEdit = (exam: any) => {
    setEditingExam(exam);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Exam
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center text-sm text-slate-400 font-bold bg-white border border-slate-200 rounded-xl">
            No exams scheduled.
          </div>
        ) : (
          data.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-all group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === exam.id ? null : exam.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpen === exam.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20 p-1">
                          <button
                            onClick={() => { onEdit(exam); setMenuOpen(null); }}
                            className="flex items-center gap-3 w-full cursor-pointer rounded-lg font-bold text-xs text-slate-600 hover:bg-slate-50 p-3"
                          >
                            Edit Schedule
                          </button>
                          <button
                            className="flex items-center gap-3 w-full cursor-pointer rounded-lg font-bold text-xs text-rose-600 hover:bg-rose-50 p-3"
                          >
                            Cancel Exam
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-black text-slate-900 mb-1">{exam.name}</h3>
                <p className="text-sm font-bold text-slate-500 mb-4">
                  {exam.academic_year?.name || "Academic Year"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center text-xs font-bold text-slate-500 gap-x-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(exam.start_date).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/exams/${exam.id}/marks`}
                    className="h-8 rounded-lg border border-slate-200 text-slate-700 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 transition-all inline-flex items-center gap-1 group-hover:translate-x-0.5"
                  >
                    Enter Marks
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                {editingExam ? "Edit Exam Schedule" : "Schedule New Exam"}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Manage examination schedules and academic years.
              </p>
            </div>
            <div className="p-5">
              <ExamForm
                initialData={editingExam}
                academicYears={academicYears}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}