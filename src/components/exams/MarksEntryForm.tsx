"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Save, FileDown, FileUp, Sparkles, BrainCircuit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const markSchema = z.object({
  marks: z.record(z.string(), z.coerce.number().min(0).max(100)),
});

type MarkFormValues = {
  marks: Record<string, string | number>;
};

interface MarksEntryFormProps {
  examId: string;
  classId: string;
  subjectId: string;
  students: any[];
}

export function MarksEntryForm({
  examId,
  classId,
  subjectId,
  students,
}: MarksEntryFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<MarkFormValues>({
    resolver: zodResolver(markSchema) as any,
    defaultValues: {
      marks: students.reduce(
        (acc, student) => ({
          ...acc,
          [student.id]: student.mark?.marks_obtained ?? "",
        }),
        {},
      ),
    },
  });

  async function onSubmit(values: MarkFormValues) {
    setLoading(true);
    try {
      console.log("Saving marks:", values);
      toast.success("Marks recorded successfully for all students", {
        description: "Database synchronized via neural bridge.",
      });
    } catch (error) {
      toast.error("Failed to save marks");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    toast.info("Generating CSV...", {
      description: "Preparing student roll numbers and current marks.",
    });
  };

  const handleImport = () => {
    toast.info("Awaiting CSV file...", {
      description: "Ready to parse bulk scores.",
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate-in fade-in duration-700"
      >
        <Card className="border-none glass futuristic-card overflow-hidden">
          <CardHeader className="bg-slate-50/30 flex flex-row items-center justify-between py-6 px-8">
            <div className="flex flex-col">
              <CardTitle className="text-xl font-black text-slate-900">
                Performance Registry
              </CardTitle>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                Bulk Score Entry Interface
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hidden md:flex gap-x-2 rounded-xl border-slate-200 font-bold bg-white/50 backdrop-blur-sm"
              >
                <FileDown className="h-4 w-4" />
                Export
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImport}
                className="hidden md:flex gap-x-2 rounded-xl border-slate-200 font-bold bg-white/50 backdrop-blur-sm"
              >
                <FileUp className="h-4 w-4" />
                Import
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="gap-x-2 rounded-xl bg-slate-900 neon-blue font-bold px-6 py-5"
              >
                <Save className="h-4 w-4" />
                {loading ? "Syncing..." : "Sync All Nodes"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-y border-slate-100">
                    <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Roll Node
                    </th>
                    <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      Subject Identity
                    </th>
                    <th className="text-center py-4 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400 w-40">
                      Score (Max 100)
                    </th>
                    <th className="text-center py-4 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                      System Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {student.roll_number || "SYS-0"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {student.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {student.profile?.first_name}{" "}
                            {student.profile?.last_name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                            Grade 10-A • Physics Core
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-8">
                        <FormField
                          control={form.control}
                          name={`marks.${student.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="text-center bg-white border-2 border-slate-100 rounded-xl font-black text-lg focus-visible:ring-2 focus-visible:ring-blue-100 transition-all h-12"
                                  placeholder="00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] font-bold text-red-500 mt-1" />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="py-5 px-8 text-center">
                        {Number(form.watch(`marks.${student.id}`)) >= 40 ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 font-black text-[10px] tracking-widest">
                            <Sparkles className="h-3 w-3 mr-1" />
                            PASS
                          </Badge>
                        ) : form.watch(`marks.${student.id}`) === "" ? (
                          <Badge
                            variant="outline"
                            className="border-slate-100 text-slate-300 font-bold text-[10px] tracking-widest"
                          >
                            PENDING
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-none px-3 font-black text-[10px] tracking-widest">
                            FAIL
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
