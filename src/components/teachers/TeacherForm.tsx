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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Given Identity</FormLabel>
                <FormControl>
                  <Input placeholder="Jane" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Surname</FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Digital Liaison (Email)</FormLabel>
              <FormControl>
                <Input placeholder="jane.smith@institutional.org" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Faculty ID</FormLabel>
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Pedagogical Credentials</FormLabel>
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
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Disciplinary Expertise (CSV)</FormLabel>
              <FormControl>
                <Input placeholder="Quantum Physics, Pure Mathematics, etc." {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-3 pt-6 border-t border-border/50">
          <Button variant="ghost" type="button" onClick={() => onSuccess()} className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-sm px-6">
            Abort
          </Button>
          <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] emerald-glow rounded-sm px-8 shadow-xl text-[10px]">
            {isPending ? "Synchronizing..." : initialData ? "Confirm Modification" : "Initialize Personnel Node"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

