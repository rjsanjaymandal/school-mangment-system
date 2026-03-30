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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  teacher_id: z.string().optional().nullable(),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: Class | null;
  teachers: { id: string; full_name: string }[];
  onSuccess: () => void;
}

export function ClassForm({ initialData, teachers, onSuccess }: ClassFormProps) {
  const router = useRouter();

  type RawFormValues = {
    name: string;
    capacity: string;
    room_number: string;
    teacher_id: string;
  };

  const form = useForm<RawFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      capacity: initialData?.capacity?.toString() || "",
      room_number: initialData?.room_number || "",
      teacher_id: initialData?.teacher_id || "none",
    },
  });

  async function onSubmit(data: RawFormValues) {
    try {
      const payload = {
        name: data.name,
        capacity: Number(data.capacity),
        room_number: data.room_number,
        teacher_id: data.teacher_id === "none" ? null : data.teacher_id,
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Name</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g. Grade 10-Alpha" 
                                    className="h-10 bg-background"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 30" 
                                        className="h-10 bg-background"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="room_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Number</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g. B-201" 
                                        className="h-10 bg-background"
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="teacher_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Class Teacher</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder="Select a teacher" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={"none"}>
                                        -- No Assigned Teacher --
                                    </SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-end gap-x-4 pt-6">
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => onSuccess()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? "Update Class" : "Create Class"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
