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
import { useTransition } from "react";
import { createTeacher, updateTeacher } from "@/app/actions/teachers";

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
  const [isPending, startTransition] = useTransition();
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
    const specializationArray = values.specialization
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = initialData
        ? await updateTeacher(initialData.id, { ...values, specialization: specializationArray })
        : await createTeacher({ ...values, specialization: specializationArray });

      if (result.success) {
        toast.success(
          initialData ? "Teacher record updated" : "Teacher added to faculty"
        );
        onSuccess();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
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
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
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
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Email</FormLabel>
              <FormControl>
                <Input placeholder="jane.smith@school.com" {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="EMP-2023-101" {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Qualification</FormLabel>
              <FormControl>
                <Input placeholder="M.Sc. Mathematics, B.Ed." {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Specialization (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Math, Physics, Calculus" {...field} className="rounded-sm bg-background/50 border-border focus:border-primary/50 transition-all font-bold placeholder:text-foreground/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-3 pt-6 border-t border-border mt-4">
          <Button variant="outline" type="button" onClick={() => onSuccess()} className="rounded-sm font-black uppercase tracking-widest text-[10px] px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground rounded-sm font-black uppercase tracking-[0.2em] text-[10px] px-8 py-6 h-auto emerald-glow shadow-xl">
            {isPending ? "Processing..." : initialData ? "Confirm Changes" : "Create Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

