"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    MoreHorizontal, Trash2, UserCheck, UserX, 
    Mail, Download, Upload, ArrowRight, RefreshCw,
    ShieldCheck, Activity, X, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
    DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BulkActionsProps {
    selectedIds: string[];
    onClearSelection: () => void;
    onRefresh: () => void;
}

export function BulkActions({ selectedIds, onClearSelection, onRefresh }: BulkActionsProps) {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleBulkStatusChange = async (status: string) => {
        if (selectedIds.length === 0) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("students")
                .update({ status })
                .in("id", selectedIds);

            if (error) throw error;

            toast.success("Status Updated", {
                description: `Updated ${selectedIds.length} students.`,
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            });
            onClearSelection();
            onRefresh();
        } catch (error) {
            toast.error("Operation Failed", { description: "Could not update students." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} students?`)) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("students")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;

            toast.success("Students Deleted", { description: `Successfully removed ${selectedIds.length} records.` });
            onClearSelection();
            onRefresh();
        } catch (error) {
            toast.error("Delete Failed", { description: "Database error detected." });
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center gap-6 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-black/20">
                <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</p>
                        <p className="text-sm font-black text-white">{selectedIds.length} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Students</span></p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-11 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 gap-2">
                                <Activity className="h-4 w-4" />
                                Update Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl backdrop-blur-xl bg-white/95">
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 py-2">Select Status</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => handleBulkStatusChange("active")}>
                                <UserCheck className="h-4 w-4 text-emerald-500" /> Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => handleBulkStatusChange("inactive")}>
                                <UserX className="h-4 w-4 text-slate-400" /> Set Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => handleBulkStatusChange("transferred")}>
                                <ArrowRight className="h-4 w-4 text-amber-500" /> Mark Transferred
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 text-xs font-bold cursor-pointer hover:bg-slate-50" onClick={() => handleBulkStatusChange("graduated")}>
                                <RefreshCw className="h-4 w-4 text-blue-500" /> Mark Graduated
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        variant="ghost" 
                        className="h-11 px-6 rounded-2xl text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 gap-2"
                    >
                        <Download className="h-4 w-4" /> Export
                    </Button>

                    <Button 
                        variant="ghost" 
                        className="h-11 w-11 rounded-2xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all active:scale-95"
                        onClick={handleBulkDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="h-8 w-[1px] bg-slate-800 mx-2" />

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClearSelection}
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}