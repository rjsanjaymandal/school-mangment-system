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
import { Student } from "@/types/database";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const studentSchema = z.object({
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
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
  const supabase = createClient();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          first_name: initialData.profile?.first_name || "",
          last_name: initialData.profile?.last_name || "",
          email: initialData.profile?.email || "",
          admission_number: initialData.admission_number || "",
          roll_number: initialData.roll_number || "",
          class_id: initialData.class_id || "",
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          admission_number: "",
          roll_number: "",
          class_id: "",
        },
  });

  async function onSubmit(values: StudentFormValues) {
    try {
      // In a real app, you'd call a server action or API route to handle
      // profile creation + student creation in a transaction (Supabase RPC or Edge Function)
      // For this demonstration, we'll mock the success
      console.log("Submitting values:", values);

      toast.success(
        initialData
          ? "Student updated successfully"
          : "Student added successfully",
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
                  <Input placeholder="John" {...field} />
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
                  <Input placeholder="Doe" {...field} />
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
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="admission_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission No.</FormLabel>
                <FormControl>
                  <Input placeholder="ADM-2023-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roll_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roll No.</FormLabel>
                <FormControl>
                  <Input placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-x-2 pt-4">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save Changes" : "Create Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
