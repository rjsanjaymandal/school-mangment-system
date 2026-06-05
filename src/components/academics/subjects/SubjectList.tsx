"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus, BookOpen } from "lucide-react";
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { SubjectForm } from "./SubjectForm";
import { deleteSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Subject Directory</h3>
        <button
          onClick={onAdd}
          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.length === 0 ? (
          <div className="col-span-full p-24 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <BookOpen className="h-16 w-16 text-slate-200 mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No subjects found</p>
          </div>
        ) : (
          data.map((subject, idx) => (
            <div
              key={subject.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-emerald-300 transition-all duration-300 animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 px-3 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center font-black text-sm tracking-widest">
                    {subject.code || "N/A"}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === subject.id ? null : subject.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpen === subject.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-20 p-1">
                          <button
                            onClick={() => { onEdit(subject); setMenuOpen(null); }}
                            className="flex items-center gap-3 w-full cursor-pointer rounded-lg font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 p-3"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <button
                            onClick={() => { onDelete(subject.id); setMenuOpen(null); }}
                            className="flex items-center gap-3 w-full cursor-pointer rounded-lg font-bold text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-3"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">
                      {subject.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {subject.description || "No description provided for this subject."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-300">
                      {subject.credits || 0} <span className="text-[10px] text-slate-400">PTS</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </div>

              <div className="h-0.5 bg-emerald-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                Create or update a subject
              </p>
            </div>
            <div className="p-5">
              <SubjectForm
                initialData={editingSubject}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}