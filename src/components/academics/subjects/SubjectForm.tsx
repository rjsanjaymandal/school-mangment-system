"use client";

import { useForm } from "react-hook-form";
import { BookOpen, Hash, Star, FileText, LayoutList } from "lucide-react";
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
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { createSubject, updateSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name is too short"),
  code: z.string().min(2, "Subject code is required"),
  credits: z.coerce.number().min(1).max(10),
  description: z.string().optional(),
  syllabus: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Subject | null;
  onSuccess: () => void;
}

export function SubjectForm({ initialData, onSuccess }: SubjectFormProps) {
  const router = useRouter();
  const form = useForm<SubjectFormValues, any, SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      credits: initialData?.credits || 4,
      description: initialData?.description || "",
      syllabus: initialData?.syllabus || "",
    },
  });

  async function onSubmit(values: SubjectFormValues) {
    try {
      let result;
      if (initialData) {
        result = await updateSubject(initialData.id, values);
      } else {
        result = await createSubject(values);
      }

      if (result.success) {
        toast.success(initialData ? "Subject updated successfully" : "Subject created successfully");
        router.refresh();
        onSuccess();
      } else {
        toast.error(String(result.error) || "Failed to save subject");
      }
    } catch (error) {
      toast.error("Critical System Error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField<SubjectFormValues>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-500" /> Subject Name
                  </label>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mathematics"
                      {...field}
                      className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField<SubjectFormValues>
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-emerald-500" /> Subject Code
                  </label>
                  <FormControl>
                    <Input
                      placeholder="e.g. MATH-101"
                      {...field}
                      className="rounded-xl border-slate-200 dark:border-slate-800 h-11 font-mono"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormField<SubjectFormValues>
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-2">
                    <Star className="h-4 w-4 text-emerald-500" /> Credits
                  </label>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        className="rounded-xl border-slate-200 dark:border-slate-800 h-11"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[10px] text-slate-400 uppercase tracking-widest pointer-events-none">Points</div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
          <div />
        </div>

        <FormField<SubjectFormValues>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" /> Description
              </label>
              <FormControl>
                <textarea
                  placeholder="Enter subject description..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-rose-500" />
            </FormItem>
          )}
        />

        <FormField<SubjectFormValues>
          control={form.control}
          name="syllabus"
          render={({ field }) => (
            <FormItem>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-emerald-500" /> Syllabus Overview
              </label>
              <FormControl>
                <textarea
                  placeholder="Enter syllabus details or curriculum breakdown..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none resize-none min-h-[160px]"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-rose-500" />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => onSuccess()}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-full md:w-1/3"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 w-full md:flex-1"
          >
            {initialData ? "Update Subject" : "Create Subject"}
          </button>
        </div>
      </form>
    </Form>
  );
}