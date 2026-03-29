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
  full_name: z.string().min(2, "Full name is too short"),
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
      full_name: initialData?.profile?.full_name || "",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
                <Input placeholder="jane.smith@example.com" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="FAC-202X-101" {...field} className="rounded-sm bg-background/50 border-border font-mono font-black text-xs uppercase" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Qualifications</FormLabel>
              <FormControl>
                <Input placeholder="Specify degrees and certifications..." {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Specialization (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="English, Mathematics, etc." {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-3 pt-6 border-t border-border/50">
          <Button variant="ghost" type="button" onClick={() => onSuccess()} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-sm px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow rounded-sm px-8 shadow-xl text-[10px]">
            {isPending ? "Saving..." : initialData ? "Save Changes" : "Add Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

