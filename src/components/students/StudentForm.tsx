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
            toast.error(res.error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter student name" {...field} className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 font-bold text-xs tracking-tight transition-all" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 uppercase ml-1" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</FormLabel>
              <FormControl>
                <Input placeholder="student@example.com" {...field} className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 font-bold text-xs tracking-tight transition-all" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold text-rose-500 uppercase ml-1" />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="admission_number"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Admission #</FormLabel>
                <FormControl>
                  <Input placeholder="ADM-001" {...field} className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 font-mono font-black text-xs transition-all" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 uppercase ml-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roll_number"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Roll #</FormLabel>
                <FormControl>
                  <Input placeholder="00" {...field} className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 font-mono font-black text-xs transition-all" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold text-rose-500 uppercase ml-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-emerald-500 font-bold text-xs transition-all">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="font-bold text-xs rounded-lg cursor-pointer transition-colors">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[9px] font-bold text-rose-500 uppercase ml-1" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3 pt-8">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => onSuccess()} 
            className="h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-11 px-10 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            {isPending ? "Saving..." : initialData ? "Update Student" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

