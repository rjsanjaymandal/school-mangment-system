"use client";

import { useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Student } from "@/types/database";
import { toast } from "sonner";
import { createStudent, updateStudent } from "@/app/actions/students";

const studentSchema = z.object({
  full_name: z.string().min(2, "Full name is too short"),
  email: z.string().email("Invalid email"),
  admission_number: z.string().min(3, "Admission number is required"),
  roll_number: z.string().optional(),
  class_id: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Student | null;
  onSuccess: () => void;
}

export function StudentForm({ initialData, onSuccess }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
        full_name: initialData.profile?.full_name || "",
        email: initialData.profile?.email || "",
        admission_number: initialData.admission_number || "",
        roll_number: initialData.roll_number || "",
        class_id: initialData.class_id || "",
      }
      : {
        full_name: "",
        email: "",
        admission_number: "",
        roll_number: "",
        class_id: "",
      },
  });

  function onSubmit(values: StudentFormValues) {
    startTransition(async () => {
      try {
        if (initialData?.id) {
          const res = await updateStudent(initialData.id, values);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Student updated successfully");
        } else {
          const res = await createStudent(values);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Student added successfully");
        }
        onSuccess();
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="admission_number"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Admission Number</FormLabel>
                <FormControl>
                  <Input placeholder="ADM-202X-001" {...field} className="rounded-sm bg-background/50 border-border font-mono font-black text-xs uppercase" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roll_number"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Roll Number</FormLabel>
                <FormControl>
                  <Input placeholder="00" {...field} className="rounded-sm bg-background/50 border-border font-mono font-black text-xs uppercase" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-x-3 pt-6">
          <Button variant="ghost" type="button" onClick={() => onSuccess()} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-sm px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow rounded-sm px-8 shadow-xl text-[10px]">
            {isPending ? "Saving..." : initialData ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

