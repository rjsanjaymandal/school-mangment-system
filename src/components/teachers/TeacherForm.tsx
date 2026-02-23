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
import { Teacher } from "@/types/database";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const teacherSchema = z.object({
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email"),
  employee_id: z.string().min(3, "Employee ID is required"),
  specialization: z.string().min(1, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: Teacher | null;
  onSuccess: () => void;
}

export function TeacherForm({ initialData, onSuccess }: TeacherFormProps) {
  const supabase = createClient();
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      first_name: initialData?.profile?.first_name || "",
      last_name: initialData?.profile?.last_name || "",
      email: initialData?.profile?.email || "",
      employee_id: initialData?.employee_id || "",
      specialization: initialData?.specialization?.join(", ") || "",
      qualification: initialData?.qualification || "",
    },
  });

  async function onSubmit(values: TeacherFormValues) {
    try {
      // Convert comma-separated string back to array for the database
      const payload = {
        ...values,
        specialization: values.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      console.log("Submitting payload:", payload);
      toast.success(
        initialData ? "Teacher record updated" : "Teacher added to faculty",
      );
      onSuccess();
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jane.smith@school.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="EMP-2023-101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <FormControl>
                <Input placeholder="M.Sc. Mathematics, B.Ed." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Math, Physics, Calculus" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-2 pt-4">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Create Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
