"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
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
  classes: any[];
  onSuccess: () => void;
}

export function StudentForm({ initialData, classes, onSuccess }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formState, setFormState] = useState({
    full_name: initialData?.profile?.full_name || "",
    email: initialData?.profile?.email || "",
    admission_number: initialData?.admission_number || "",
    roll_number: initialData?.roll_number || "",
    class_id: initialData?.class_id || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = studentSchema.safeParse(formState);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (initialData?.id) {
          const nameParts = formState.full_name.trim().split(" ");
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";
          const res = await updateStudent(initialData.id, { ...formState, first_name, last_name });
          if ("error" in res && res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Student updated successfully");
        } else {
          const nameParts = formState.full_name.trim().split(" ");
          const first_name = nameParts[0] || "";
          const last_name = nameParts.slice(1).join(" ") || "";
          const res = await createStudent({ ...formState, first_name, last_name });
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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Full Name</label>
          <Input
            placeholder="Enter student name"
            value={formState.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            className="h-12 rounded-xl border-slate-200 font-bold text-xs tracking-tight"
          />
          {errors.full_name && <p className="text-[9px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email Address</label>
          <Input
            placeholder="student@example.com"
            value={formState.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="h-12 rounded-xl border-slate-200 font-bold text-xs tracking-tight"
          />
          {errors.email && <p className="text-[9px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Admission #</label>
            <Input
              placeholder="ADM-001"
              value={formState.admission_number}
              onChange={(e) => handleChange("admission_number", e.target.value)}
              className="h-12 rounded-xl border-slate-200 font-mono font-black text-xs"
            />
            {errors.admission_number && <p className="text-[9px] font-bold text-rose-500 uppercase ml-1 mt-1">{errors.admission_number}</p>}
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Roll #</label>
            <Input
              placeholder="00"
              value={formState.roll_number}
              onChange={(e) => handleChange("roll_number", e.target.value)}
              className="h-12 rounded-xl border-slate-200 font-mono font-black text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Class</label>
            <select
              className="w-full h-12 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 bg-white focus:border-blue-300 outline-none"
              value={formState.class_id}
              onChange={(e) => handleChange("class_id", e.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-8">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
        >
          {isPending ? "Saving..." : initialData ? "Update Student" : "Add Student"}
        </button>
      </div>
    </form>
  );
}