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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class } from "@/types/database";
import { toast } from "sonner";
import { createClass, updateClass } from "@/app/actions/classes";
import { useRouter } from "next/navigation";
import { School, Users, DoorOpen, User, GraduationCap } from "lucide-react";

const classSchema = z.object({
  name: z.string().min(2, "Class name is too short"),
  capacity: z
    .string()
    .refine((val) => !isNaN(Number(val)), "Capacity must be a number")
    .transform(Number),
  room_number: z.string().min(1, "Room number is required"),
  teacher_id: z.string().optional().nullable(),
  grade_level: z.string().optional().nullable(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: Class | null;
  teachers: { id: string; full_name: string }[];
  onSuccess: () => void;
}

export function ClassForm({ initialData, teachers, onSuccess }: ClassFormProps) {
  const router = useRouter();

  type RawFormValues = {
    name: string;
    capacity: string;
    room_number: string;
    teacher_id: string;
    grade_level: string;
  };

  const form = useForm<RawFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      capacity: initialData?.capacity?.toString() || "",
      room_number: initialData?.room_number || "",
      teacher_id: initialData?.teacher_id || "none",
      grade_level: initialData?.grade_level || "",
    },
  });

  async function onSubmit(data: RawFormValues) {
    try {
      const payload = {
        name: data.name,
        capacity: Number(data.capacity),
        room_number: data.room_number,
        teacher_id: data.teacher_id === "none" ? null : data.teacher_id,
        grade_level: data.grade_level || null,
      };

      let result;
      if (initialData) {
        result = await updateClass(initialData.id, payload);
      } else {
        result = await createClass(payload);
      }

      if (result.success) {
        toast.success(initialData ? "Class updated successfully" : "Class created successfully");
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to save class");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">
                                <School className="h-4 w-4 text-emerald-500" /> Class Name
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        placeholder="e.g. Grade 10-Alpha" 
                                        className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm"
                                        {...field} 
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">
                                    <Users className="h-4 w-4 text-blue-500" /> Capacity
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 30" 
                                        className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="room_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">
                                    <DoorOpen className="h-4 w-4 text-indigo-500" /> Room Number
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g. B-201" 
                                        className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                    <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">
                                    <GraduationCap className="h-4 w-4 text-purple-500" /> Grade Level
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g. 10, Kindergarten" 
                                        className="h-12 pl-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 transition-all focus:bg-white dark:focus:bg-slate-900 shadow-sm"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                <FormField
                    control={form.control}
                    name="teacher_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">
                                <User className="h-4 w-4 text-orange-500" /> Class Teacher
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-emerald-500/50 transition-all shadow-sm">
                                        <SelectValue placeholder="Select a teacher" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
                                    <SelectItem value={"none"}>
                                        -- No Assigned Teacher --
                                    </SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-end gap-x-4 pt-8">
                    <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => onSuccess()}
                        className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                        {initialData ? "Update Class" : "Create Class"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
