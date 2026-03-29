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
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import { useTransition } from "react";
import { createParent } from "@/app/actions/parents";

const parentSchema = z.object({
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  occupation: z.string().optional(),
  relation_to_student: z
    .string()
    .min(2, "Relation is required (e.g. Father, Mother)"),
});

type ParentFormValues = z.infer<typeof parentSchema>;

interface ParentFormProps {
  studentId: string;
  onSuccess: () => void;
}

export function ParentForm({ studentId, onSuccess }: ParentFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      occupation: "",
      relation_to_student: "",
    },
  });

  async function onSubmit(values: ParentFormValues) {
    startTransition(async () => {
      try {
        const res = await createParent({ ...values, studentId });
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Parent profile created and linked successfully");
        onSuccess();
      } catch (error) {
        toast.error("Something went wrong");
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
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Michael" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
                <Input placeholder="michael.doe@example.com" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 234 567 890" {...field} className="rounded-sm bg-background/50 border-border font-mono font-bold text-xs uppercase tracking-tight" />
              </FormControl>
              <FormMessage className="text-[9px] font-bold uppercase" />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Sector Specialist" {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
                </FormControl>
                <FormMessage className="text-[9px] font-bold uppercase" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="relation_to_student"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Relation to Student</FormLabel>
                <FormControl>
                  <Input placeholder="Father, Mother, etc." {...field} className="rounded-sm bg-background/50 border-border font-bold text-xs uppercase tracking-tight" />
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
            {isPending ? "Saving..." : "Add Parent"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

