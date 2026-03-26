"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Plus, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Subject } from "@/types/database";
import { toast } from "sonner";
import { SubjectForm } from "./SubjectForm";
import { deleteSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";

interface SubjectListProps {
  initialData: Subject[];
}

export function SubjectList({ initialData }: SubjectListProps) {
  const router = useRouter();
  const [data, setData] = useState<Subject[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const onAdd = () => {
    setEditingSubject(null);
    setIsOpen(true);
  };

  const onEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const res = await deleteSubject(id);
    if (res.success) {
      toast.success("Subject deleted successfully");
      router.refresh();
      setData(data.filter((s) => s.id !== id));
    } else {
      toast.error(res.error || "Failed to delete subject");
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in transition-all duration-1000 relative reveal-1">
      {/* Background Matrix Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
        <div className="flex items-center gap-x-8">
          <div className="h-20 w-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(16,185,129,0.15)] skew-x-[-12deg] group hover:bg-primary hover:text-primary-foreground transition-all duration-700">
            <BookOpen className="h-10 w-10 skew-x-[12deg] transition-all duration-700" />
          </div>
          <div>
            <div className="relative">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">Knowledge <span className="text-primary italic">Registry</span></h1>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-primary/40 skew-x-[-24deg]" />
            </div>
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> Institutional Intellectual Asset Vault
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onAdd} 
          className="group relative h-16 px-12 bg-primary/10 text-primary font-black rounded-none border border-primary/20 hover:bg-primary/20 transition-all duration-500 skew-x-[-12deg] overflow-hidden"
        >
          <span className="relative z-10 skew-x-[12deg] flex items-center gap-x-4 uppercase tracking-[0.2em] text-[10px]">
            Initialize Node
            <Plus className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
          </span>
          <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20" />
        </Button>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 reveal-2 relative z-10">
        {data.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center glass-panel border-dashed border-primary/20 skew-x-[-8deg] rounded-none">
             <div className="not-skew-x flex flex-col items-center">
               <BookOpen className="h-16 w-16 text-primary/10 mb-6 animate-pulse" />
               <p className="text-[12px] font-mono font-black uppercase tracking-[0.6em] text-foreground/20 italic">No subject nodes detected [NULL_DATA]</p>
             </div>
          </div>
        ) : (
          data.map((subject, i) => (
            <div
              key={subject.id}
              className="group relative transition-all duration-700 hover:-translate-y-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Telemetric Background */}
              <div className="absolute inset-0 bg-primary/5 skew-x-[-12deg] translate-x-4 translate-y-4 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="relative glass-panel p-0 overflow-hidden border-primary/10 group-hover:border-primary/40 transition-all duration-700 skew-x-[-12deg] rounded-none shadow-2xl group-hover:shadow-primary/10">
                {/* Header Protocol Strip */}
                <div className="bg-primary/5 border-b border-primary/10 p-6 flex items-center justify-between not-skew-x">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-none bg-primary animate-[pulse_2s_infinite]" />
                    <span className="font-mono text-[11px] font-black text-primary/60 tracking-[0.3em] italic uppercase">
                      {subject.code || `NODE_${subject.id.slice(0, 4).toUpperCase()}`}
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 p-0 text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-none border border-transparent hover:border-primary/20 transition-all">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel border-primary/20 p-2 shadow-2xl min-w-[200px] rounded-none skew-x-[-8deg]">
                      <div className="not-skew-x">
                        <DropdownMenuLabel className="text-[9px] font-mono font-black uppercase tracking-[0.5em] opacity-40 px-4 py-3 border-b border-primary/10">System_Protocols</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEdit(subject)}
                          className="gap-x-4 cursor-pointer font-black uppercase text-[10px] tracking-widest focus:bg-primary/10 focus:text-primary p-4 rounded-none transition-colors italic"
                        >
                          <Pencil className="h-4 w-4" /> Modify_Parameters
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/10" />
                        <DropdownMenuItem
                          onClick={() => onDelete(subject.id)}
                          className="gap-x-4 text-red-500 focus:text-red-400 cursor-pointer font-black uppercase text-[10px] tracking-widest focus:bg-red-500/10 p-4 rounded-none transition-colors italic"
                        >
                          <Trash2 className="h-4 w-4" /> Terminate_Node
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-10 space-y-8 not-skew-x">
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-black text-foreground text-3xl uppercase tracking-tighter italic leading-none group-hover:text-primary transition-all duration-700">
                        {subject.name}
                      </h4>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                    </div>
                    <p className="text-[11px] text-foreground/40 font-mono font-black uppercase tracking-[0.15em] leading-relaxed line-clamp-3 min-h-[48px] italic">
                      {subject.description || "Core conceptual framework for academic advancement and institutional knowledge propagation."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <div className="w-full h-px bg-primary" />
                      <div className="h-full w-px bg-primary" />
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-primary/5 group-hover:border-primary/20 transition-all relative overflow-hidden">
                      <p className="text-[9px] font-mono font-black text-foreground/30 uppercase tracking-widest mb-2 italic">Integrity_Value</p>
                      <p className="text-3xl font-black text-primary italic leading-none">{subject.credits || 0} <span className="text-[11px] not-italic opacity-40 font-mono tracking-widest ml-1">CRD</span></p>
                      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-primary/20" />
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-primary/5 group-hover:border-primary/20 transition-all relative overflow-hidden">
                      <p className="text-[9px] font-mono font-black text-foreground/30 uppercase tracking-widest mb-2 italic">Operation_Status</p>
                      <p className="text-sm font-black text-foreground/80 italic leading-none uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-none bg-primary" /> ACTIVE
                      </p>
                      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-primary/20" />
                    </div>
                  </div>
                </div>

                {/* Bottom Protocol Decoration */}
                <div className="h-[2px] w-full bg-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary w-2/3 animate-[shimmer_3s_infinite]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-panel border-primary/10 p-0 overflow-hidden max-w-2xl rounded-none shadow-2xl group/modal">
          <div className="p-12 bg-primary/5 border-b border-primary/10 relative overflow-hidden">
            <BookOpen className="absolute right-[-30px] top-[-30px] h-48 w-48 text-primary opacity-5 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                {editingSubject ? "Protocol" : "Node"} <span className="text-primary italic">{editingSubject ? "Modification" : "Initialization"}</span>
              </h3>
              <p className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-foreground/30 mt-4 italic flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" /> Academic Framework Data-stream
              </p>
            </div>
          </div>
          
          <div className="p-2">
            <SubjectForm
              initialData={editingSubject}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
          
          {/* Modal Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[8px] font-black uppercase tracking-widest text-primary vertical-rl">
            [SYS_REGISTER_PRTCL_V4.2]
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

