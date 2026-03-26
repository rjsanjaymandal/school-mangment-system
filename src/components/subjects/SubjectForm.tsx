"use client";

import { useForm } from "react-hook-form";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { createSubject, updateSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";

const subjectSchema = z.object({
  name: z.string().min(2, "Subject name is too short"),
  code: z.string().min(2, "Subject code is required"),
  credits: z.coerce.number().min(1).max(10),
  description: z.string().optional(),
  syllabus: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Subject | null;
  onSuccess: () => void;
}

export function SubjectForm({ initialData, onSuccess }: SubjectFormProps) {
  const router = useRouter();
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      credits: initialData?.credits || 4,
      description: initialData?.description || "",
      syllabus: initialData?.syllabus || "",
    },
  });

  async function onSubmit(values: SubjectFormValues) {
    try {
      let result;
      if (initialData) {
        result = await updateSubject(initialData.id, values);
      } else {
        result = await createSubject(values);
      }

      if (result.success) {
        toast.success(initialData ? "Node Modified" : "Node Initialized");
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error || "Execution Failure");
      }
    } catch (error) {
      toast.error("Critical System Error");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 p-12 bg-transparent relative overflow-hidden">
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] -translate-y-1/2 pointer-events-none animate-[scanline_8s_linear_infinite]" />
        
        <div className="grid grid-cols-6 gap-8 relative z-10">
          <div className="col-span-4 translate-z-10 skew-x-[-12deg]">
            <FormField<SubjectFormValues>
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-[0.5em] ml-2 skew-x-[12deg]">Node Identity</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="QUANTUM MECHANICS" 
                      {...field} 
                      className="h-16 rounded-none bg-white/5 border-primary/20 font-black text-md uppercase tracking-tight focus:border-primary focus:bg-primary/5 transition-all px-8 shadow-inner" 
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 skew-x-[12deg]" />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 skew-x-[-12deg]">
            <FormField<SubjectFormValues>
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-[0.5em] ml-2 skew-x-[12deg]">Registry ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="QM-301" 
                      {...field} 
                      className="h-16 rounded-none bg-white/5 border-primary/20 font-mono font-black text-md uppercase tracking-widest focus:border-primary focus:bg-primary/5 transition-all px-8 shadow-inner" 
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 skew-x-[12deg]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-8 relative z-10">
          <div className="col-span-4 skew-x-[-12deg]">
            <FormField<SubjectFormValues>
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-[0.5em] ml-2 skew-x-[12deg]">Metric_Value (Credits)</FormLabel>
                  <FormControl>
                    <div className="relative group/input overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/input:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        {...field} 
                        className="h-20 rounded-none bg-white/5 border-primary/20 font-black text-3xl italic focus:border-primary focus:bg-primary/5 transition-all px-10 shadow-2xl group-hover/input:border-primary/40" 
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[11px] font-black opacity-30 text-primary uppercase tracking-widest skew-x-[12deg] pointer-events-none">CRD_UNIT</div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 skew-x-[12deg]" />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 flex items-end pb-2">
            <div className="h-16 w-full border-l border-b border-primary/20 relative skew-x-[-12deg]">
              <div className="absolute bottom-0 right-0 h-4 w-4 border-r border-b border-primary/40" />
              <div className="absolute top-0 left-4 font-mono text-[8px] font-black text-primary/30 uppercase tracking-[0.4em] skew-x-[12deg]">VAL_VERIFY</div>
            </div>
          </div>
        </div>

        <FormField<SubjectFormValues>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-4 skew-x-[-12deg] relative z-10">
              <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-[0.5em] ml-2 skew-x-[12deg]">Conceptual_Framework</FormLabel>
              <FormControl>
                <div className="relative group/textarea overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/textarea:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <Textarea
                    placeholder="DEFINE THE STRATEGIC OBJECTIVES OF THIS KNOWLEDGE NODE..."
                    className="resize-none rounded-none bg-white/5 border-primary/20 min-h-[140px] font-bold text-[13px] py-8 px-10 focus:border-primary focus:bg-primary/5 transition-all italic uppercase tracking-tight shadow-2xl group-hover/textarea:border-primary/40 leading-relaxed"
                    {...field}
                  />
                  <div className="absolute bottom-4 right-6 font-mono text-[8px] font-black opacity-20 text-primary uppercase tracking-[0.3em] skew-x-[12deg] pointer-events-none">[DESC_PRTCL]</div>
                </div>
              </FormControl>
              <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 skew-x-[12deg]" />
            </FormItem>
          )}
        />

        <FormField<SubjectFormValues>
          control={form.control}
          name="syllabus"
          render={({ field }) => (
            <FormItem className="space-y-4 relative z-10 skew-x-[-4deg]">
              <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-[0.5em] ml-2 skew-x-[4deg]">Curriculum_Logic_Mapping</FormLabel>
              <FormControl>
                <div className="relative group/syll">
                  <div className="absolute -inset-[1px] bg-primary/20 opacity-0 group-hover/syll:opacity-100 transition duration-700 pointer-events-none" />
                  <Textarea
                    placeholder="PHASE 01: FOUNDATIONS | PHASE 02: THEORETICAL_PHYSICS | PHASE 03: APPLIED_LOGIC..."
                    className="relative resize-none rounded-none bg-black/40 border-primary/20 min-h-[200px] font-mono text-[11px] py-8 px-10 focus:border-primary focus:bg-black/60 transition-all leading-loose tracking-[0.1em] uppercase glass-panel group-hover/syll:border-primary/40"
                    {...field}
                  />
                  <div className="absolute top-4 right-6 opacity-10 animate-pulse pointer-events-none">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-[9px] font-black uppercase tracking-widest text-red-500/80 skew-x-[4deg]" />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row items-center gap-6 pt-12 relative z-10">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={() => onSuccess()} 
            className="w-full md:w-1/3 h-20 text-[10px] font-black uppercase tracking-[0.6em] text-foreground/30 hover:text-red-500 hover:bg-red-500/5 rounded-none transition-all skew-x-[-12deg] border border-transparent hover:border-red-500/20"
          >
            <span className="skew-x-[12deg] flex items-center gap-x-3">
              <Trash2 className="h-4 w-4" /> ABORT_PRTCL
            </span>
          </Button>
          <Button 
            type="submit" 
            className="w-full md:flex-1 h-24 bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] emerald-border-glow rounded-none shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden group transition-all hover:scale-[1.02] skew-x-[-12deg] border border-white/10"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_4s_infinite]" />
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20" />
            <span className="relative z-10 italic skew-x-[12deg] flex items-center gap-x-4 text-xl">
               {initialData ? "APPLY_REFINEMENT" : "AUTHORIZE_NODE"}
               <Plus className="h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />
            </span>
          </Button>
        </div>
      </form>
    </Form>
  );
}

