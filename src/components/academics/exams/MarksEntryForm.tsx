"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveMarks } from "@/app/actions/exams";
import { useRouter } from "next/navigation";
import { Save, FileDown, FileUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const markSchema = z.object({
  marks: z.record(z.string(), z.union([z.coerce.number().min(0).max(100), z.literal("")])),
});

type MarkFormValues = {
  marks: Record<string, number | "">;
};

interface MarksEntryFormProps {
  examId: string;
  classId: string;
  subjectId: string;
  className: string;
  subjectName: string;
  students: any[];
}

export function MarksEntryForm({
  examId,
  classId,
  subjectId,
  className,
  subjectName,
  students,
}: MarksEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<MarkFormValues, any, MarkFormValues>({
    resolver: zodResolver(markSchema) as any,
    defaultValues: {
      marks: (students || []).reduce(
        (acc, student) => ({
          ...acc,
          [student.id]: student.mark?.marks_obtained ?? "",
        }),
        {},
      ),
    },
  });

  async function onSubmit(values: MarkFormValues) {
    setLoading(true);
    try {
      const rows = Object.entries(values.marks)
        .filter(([_, mark]) => mark !== "")
        .map(([studentId, mark]) => ({
          exam_id: examId,
          student_id: studentId,
          subject_id: subjectId,
          marks_obtained: Number(mark),
        }));

      if (rows.length === 0) {
        toast.info("No marks to save");
        return;
      }

      const result = await saveMarks(rows);
      if (result.success) {
        toast.success("Marks recorded successfully for all students");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to sync marks");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    toast.info("Generating CSV...");
  };

  const handleImport = () => {
    toast.info("Awaiting CSV file...");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate-in fade-in duration-700"
      >
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-lg font-black tracking-tight text-slate-900">Performance Registry</h3>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mt-1">
                Bulk Score Entry Interface
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <button
                type="button"
                onClick={handleExport}
                className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all hidden md:inline-flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all hidden md:inline-flex items-center gap-2"
              >
                <FileUp className="h-4 w-4" />
                Import
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Syncing..." : "Sync All Nodes"}
              </button>
            </div>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-y border-slate-200">
                    <th className="text-left py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-500">Roll Node</th>
                    <th className="text-left py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-500">Subject Identity</th>
                    <th className="text-center py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-500 w-40">Score (Max 100)</th>
                    <th className="text-center py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-500">System Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {student.roll_number || "SYS-0"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {student.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {student.profile?.first_name}{" "}
                            {student.profile?.last_name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold tracking-tight">
                            {className || "Class not assigned"} &bull; {subjectName || "Subject not assigned"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <FormField
                          control={form.control}
                          name={`marks.${student.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="text-center bg-white border-2 border-slate-200 rounded-xl font-black text-lg focus-visible:ring-2 focus-visible:ring-blue-100 transition-all h-12"
                                  placeholder="00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] font-bold text-red-500 mt-1" />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        {Number(form.watch(`marks.${student.id}`)) >= 40 ? (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                            <Sparkles className="h-3 w-3 mr-1 inline" />
                            PASS
                          </span>
                        ) : form.watch(`marks.${student.id}`) === "" ? (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 text-slate-400">
                            PENDING
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}