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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  classes: any[];
  onSuccess: () => void;
}

export function StudentForm({ initialData, classes, onSuccess }: StudentFormProps) {
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
          const nameParts = values.full_name.trim().split(" ");
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";
          const res = await updateStudent(initialData.id, { ...values, first_name, last_name });
          if ("error" in res && res.error) {
            toast.error(String(res.error));
            return;
          }
          toast.success("Student updated successfully");
        } else {
          const nameParts = values.full_name.trim().split(" ");
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";
          const res = await createStudent({ ...values, first_name, last_name });
          if ("error" in res && res.error) {
            toast.error(String(res.error));
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
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="admission_number"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Admission#</FormLabel>
                <FormControl>
                  <Input placeholder="ADM-001" {...field} className="rounded-sm bg-background/50 border-border font-mono font-black text-xs uppercase h-10" />
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
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Roll#</FormLabel>
                <FormControl>
                  <Input placeholder="00" {...field} className="rounded-sm bg-background/50 border-border font-mono font-black text-xs uppercase h-10" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border shadow-2xl">
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="font-bold text-[10px] uppercase tracking-tighter cursor-pointer focus:bg-primary/10 focus:text-primary">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

