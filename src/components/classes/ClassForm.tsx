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
import { Class } from "@/types/database";
import { toast } from "sonner";
import { createClass, updateClass } from "@/app/actions/classes";
import { useRouter } from "next/navigation";

const classSchema = z.object({
  name: z.string().min(2, "Class name is too short"),
  capacity: z
    .string()
    .refine((val) => !isNaN(Number(val)), "Capacity must be a number")
    .transform(Number),
  room_number: z.string().min(1, "Room number is required"),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: Class | null;
  onSuccess: () => void;
}

export function ClassForm({ initialData, onSuccess }: ClassFormProps) {
  const router = useRouter();

  type RawFormValues = {
    name: string;
    capacity: string;
    room_number: string;
  };

  const form = useForm<RawFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      capacity: initialData?.capacity?.toString() || "",
      room_number: initialData?.room_number || "",
    },
  });

  async function onSubmit(data: RawFormValues) {
    try {
      const payload = {
        name: data.name,
        capacity: Number(data.capacity),
        room_number: data.room_number,
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
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8 reveal-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Class Name</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g. Grade 10-Alpha" 
                                    className="h-12 bg-card border-border rounded-lg font-bold text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-primary/50 transition-all"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive italic" />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Capacity</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 30" 
                                        className="h-12 bg-card border-border rounded-lg font-bold text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-primary/50 transition-all"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive italic" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="room_number"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Room Number</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g. B-201" 
                                        className="h-12 bg-card border-border rounded-lg font-bold text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-primary/50 transition-all"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive italic" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center justify-end gap-x-4 pt-8 border-t border-border">
                    <button 
                        type="button" 
                        onClick={() => onSuccess()}
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors italic"
                    >
                        Cancel
                    </button>
                    <Button 
                        type="submit"
                        className="h-12 px-8 bg-primary text-primary-foreground font-bold rounded-lg shadow-sm uppercase tracking-widest text-[9px] transition-all hover:scale-105"
                    >
                        {initialData ? "Update Class" : "Create Class"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
