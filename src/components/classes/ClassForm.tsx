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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Formation Alias</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g. GRADE 10-ALPHA" 
                                    className="rounded-sm border-border bg-card/40 backdrop-blur-md h-12 text-[11px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500/80" />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Occupancy Cap</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="30" 
                                        className="rounded-sm border-border bg-card/40 backdrop-blur-md h-12 text-[11px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500/80" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="room_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Spatial ID (Room)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="B-201" 
                                        className="rounded-sm border-border bg-card/40 backdrop-blur-md h-12 text-[11px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500/80" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-x-3 pt-6">
                    <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => onSuccess()}
                        className="rounded-sm border-border bg-transparent font-black uppercase tracking-widest text-[10px] px-6 h-10 hover:bg-primary/5 transition-all"
                    >
                        Abort
                    </Button>
                    <Button 
                        type="submit"
                        className="rounded-sm bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-8 h-10 emerald-glow transition-all hover:bg-primary/90"
                    >
                        {initialData ? "Synchronize Node" : "Initialize Link"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
