"use client";

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
import { createExam, updateExam } from "@/app/actions/exams";
import { useRouter } from "next/navigation";

const examSchema = z.object({
  name: z.string().min(2, "Exam name is too short"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamFormProps {
  initialData?: any | null;
  academicYears: any[];
  onSuccess: () => void;
}

export function ExamForm({
  initialData,
  academicYears,
  onSuccess,
}: ExamFormProps) {
  const router = useRouter();
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: initialData?.name || "",
      academic_year_id: initialData?.academic_year_id || "",
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
    },
  });

  async function onSubmit(values: ExamFormValues) {
    try {
      let result;
      if (initialData) {
        result = await updateExam(initialData.id, values);
      } else {
        result = await createExam(values);
      }

      if (result.success) {
        toast.success(initialData ? "Exam schedule updated" : "Exam scheduled successfully");
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to save exam");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Exam Name</label>
              <FormControl>
                <Input placeholder="Midterm Examination 2024" {...field} className="rounded-xl border-slate-200 h-11" />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-rose-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="academic_year_id"
          render={({ field }) => (
            <FormItem>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Academic Year</label>
              <FormControl>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="" disabled>Select academic year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                  {academicYears.length === 0 && (
                    <option value="none" disabled>No years available</option>
                  )}
                </select>
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-rose-500" />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Start Date</label>
                <FormControl>
                  <Input type="date" {...field} className="rounded-xl border-slate-200 h-11" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">End Date</label>
                <FormControl>
                  <Input type="date" {...field} className="rounded-xl border-slate-200 h-11" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-rose-500" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-x-2 pt-4">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
          >
            {initialData ? "Save Changes" : "Schedule Exam"}
          </button>
        </div>
      </form>
    </Form>
  );
}