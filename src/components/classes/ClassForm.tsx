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
                        <FormItem className="space-y-4">
                            <div className="flex items-center gap-x-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Formation Alias</FormLabel>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <FormControl>
                                <Input 
                                    placeholder="E.G. NODE: GRADE 10-ALPHA" 
                                    className="h-14 bg-white/5 border-white/10 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] italic placeholder:text-foreground/10 focus-visible:ring-emerald-500/50 skew-x-[-8deg] transition-all group-hover:bg-white/10"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 italic" />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <div className="flex items-center gap-x-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Occupancy Cap</FormLabel>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="MAX_UNITS: 30" 
                                        className="h-14 bg-white/5 border-white/10 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] italic placeholder:text-foreground/10 focus-visible:ring-emerald-500/50 skew-x-[-8deg] transition-all"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 italic" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="room_number"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <div className="flex items-center gap-x-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">Spatial ID</FormLabel>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>
                                <FormControl>
                                    <Input 
                                        placeholder="LOC: B-201" 
                                        className="h-14 bg-white/5 border-white/10 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] italic placeholder:text-foreground/10 focus-visible:ring-emerald-500/50 skew-x-[-8deg] transition-all"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 italic" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex items-center justify-end gap-x-6 pt-10 border-t border-white/5">
                    <button 
                        type="button" 
                        onClick={() => onSuccess()}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground transition-colors italic"
                    >
                        Abort_Process
                    </button>
                    <Button 
                        type="submit"
                        className="h-14 px-10 bg-emerald-500 text-white font-black rounded-sm shadow-[0_0_40px_oklch(var(--emerald-500)/0.2)] emerald-border-glow uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg] transition-all hover:scale-105"
                    >
                        <span className="not-skew-x">
                            {initialData ? "Synchronize_Node" : "Initialize_Link"}
                        </span>
                    </Button>
                </div>
            </form>
        </Form>
    );
}
