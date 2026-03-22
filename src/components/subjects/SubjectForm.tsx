"use client";

import { useForm } from "react-hook-form";
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
  description: z.string().optional(),
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
      description: initialData?.description || "",
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
        toast.error(result.error || "Failed to save subject");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Node Identity</FormLabel>
                <FormControl>
                  <Input placeholder="Mathematics" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">ID Code</FormLabel>
                <FormControl>
                  <Input placeholder="MATH101" {...field} className="rounded-sm bg-background/50 border-border font-mono font-bold text-xs uppercase tracking-tight" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Conceptual Framework</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Specify the tactical objectives and curriculum scope..."
                  className="resize-none rounded-sm bg-background/50 border-border min-h-[100px] font-medium text-xs py-3"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-3 pt-6">
          <Button variant="ghost" type="button" onClick={() => onSuccess()} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-sm px-6">
            Abort
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow rounded-sm px-8 shadow-xl text-[10px]">
            {initialData ? "Apply Modification" : "Initialize Framework"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

