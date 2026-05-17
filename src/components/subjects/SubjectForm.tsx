"use client";

import { useForm } from "react-hook-form";
import { BookOpen, Pencil, Plus, Trash2, Hash, Star, FileText, LayoutList } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="col-span-1">
            <FormField<SubjectFormValues>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 ml-1">
                    <BookOpen className="h-4 w-4 text-indigo-500" /> Subject Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Mathematics" 
                      {...field} 
                      className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-indigo-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm font-semibold" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1">
            <FormField<SubjectFormValues>
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 ml-1">
                    <Hash className="h-4 w-4 text-emerald-500" /> Subject Code
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. MATH-101" 
                      {...field} 
                      className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-indigo-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm font-mono font-bold" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="col-span-1">
            <FormField<SubjectFormValues>
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 ml-1">
                    <Star className="h-4 w-4 text-amber-500" /> Credits
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        {...field} 
                        className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-indigo-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm font-bold text-lg" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-400 uppercase tracking-widest pointer-events-none">Points</div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-rose-500" />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 flex items-end">
          </div>
        </div>
        

        <FormField<SubjectFormValues>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5 relative z-10">
              <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 ml-1">
                <FileText className="h-4 w-4 text-blue-500" /> Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter subject description..."
                  className="resize-none rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-indigo-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm min-h-[100px] font-medium text-sm py-4 px-4"
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
            <FormItem className="space-y-1.5 relative z-10">
              <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 ml-1">
                <LayoutList className="h-4 w-4 text-purple-500" /> Syllabus Overview
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter syllabus details or curriculum breakdown..."
                  className="resize-none rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-indigo-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm min-h-[160px] font-medium text-sm py-4 px-4"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-rose-500" />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row items-center gap-4 pt-8 relative z-10">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => onSuccess()} 
            className="w-full md:w-1/3 h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="w-full md:flex-1 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
             {initialData ? "Update Subject" : "Create Subject"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

