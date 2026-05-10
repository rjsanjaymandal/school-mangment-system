"use client";

import { useForm } from "react-hook-form";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
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
        toast.success(initialData ? "Node Modified" : "Node Initialized");
        router.refresh();
        onSuccess();
      } else {
        toast.error(String(result.error) || "Execution Failure");
      }
    } catch (error) {
      toast.error("Critical System Error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-10 bg-card relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="col-span-1">
            <FormField<SubjectFormValues>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Subject Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Mathematics" 
                      {...field} 
                      className="h-11 rounded-md border-border bg-muted/20 font-semibold focus:border-primary transition-all px-4" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-destructive" />
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
                  <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Subject Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. MATH-101" 
                      {...field} 
                      className="h-11 rounded-md border-border bg-muted/20 font-mono font-bold focus:border-primary transition-all px-4" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-destructive" />
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
                  <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Credits</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        {...field} 
                        className="h-11 rounded-md border-border bg-muted/20 font-bold text-lg focus:border-primary transition-all px-4" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest pointer-events-none">Points</div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-destructive" />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 flex items-end">
            <div className="h-11 w-full bg-muted/10 rounded-md border border-dashed border-border flex items-center justify-center">
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Verification Pending</span>
            </div>
          </div>
        </div>
        

        <FormField<SubjectFormValues>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5 relative z-10">
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter subject description..."
                  className="resize-none rounded-md border-border bg-muted/20 min-h-[100px] font-medium text-sm py-4 px-4 focus:border-primary transition-all shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-destructive" />
            </FormItem>
          )}
        />

        <FormField<SubjectFormValues>
          control={form.control}
          name="syllabus"
          render={({ field }) => (
            <FormItem className="space-y-1.5 relative z-10">
              <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Syllabus Overview</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter syllabus details or curriculum breakdown..."
                  className="resize-none rounded-md border-border bg-muted/20 min-h-[160px] font-medium text-sm py-4 px-4 focus:border-primary transition-all shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold text-destructive" />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row items-center gap-4 pt-8 relative z-10">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => onSuccess()} 
            className="w-full md:w-1/3 h-11 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all border border-transparent hover:border-destructive/20"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="w-full md:flex-1 h-11 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-md shadow-lg transition-all hover:bg-primary/90 text-[11px]"
          >
             {initialData ? "Update Subject" : "Create Subject"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

