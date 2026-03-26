"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { assignStudentTransport } from "@/app/actions/transport";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentAssignmentDialogProps {
    routes: any[];
    stops: any[];
}

export function StudentAssignmentDialog({ routes, stops }: StudentAssignmentDialogProps) {
    const router = useRouter();
    const supabase = createClient();
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);

    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [selectedStopId, setSelectedStopId] = useState("");

    const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchStudents();
        }
    }, [open]);

    const fetchStudents = async () => {
        setFetchingStudents(true);
        const { data, error } = await supabase
            .from("students")
            .select("id, profile:profiles(first_name, last_name)")
            .order("id");

        if (error) {
            toast.error("Failed to fetch students");
        } else {
            setStudents(data || []);
        }
        setFetchingStudents(false);
    };

    const handleAssign = async () => {
        if (!selectedStudentId || !selectedRouteId) {
            return toast.error("Please select a student and a route");
        }

        setLoading(true);
        const result = await assignStudentTransport({
            student_id: selectedStudentId,
            route_id: selectedRouteId,
            stop_id: selectedStopId || undefined,
        });
        setLoading(false);

        if (result.success) {
            setOpen(false);
            setSelectedStudentId("");
            setSelectedRouteId("");
            setSelectedStopId("");
            router.refresh();
            toast.success("Student assigned successfully");
        } else {
            toast.error(result.error);
        }
    };

    const filteredStops = stops.filter(s => s.route_id === selectedRouteId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="group relative rounded-none h-12 bg-primary/10 hover:bg-primary/20 text-primary font-black px-8 skew-x-[-12deg] transition-all duration-300 border border-primary/20 overflow-hidden">
                    <span className="relative z-10 skew-x-[12deg] flex items-center gap-3 uppercase tracking-[0.1em] text-xs">
                        <UserPlus className="h-4 w-4" /> Assign Student
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 border-none bg-[#050505]/95 backdrop-blur-3xl max-w-lg overflow-hidden ring-1 ring-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <div className="bg-primary/10 border-b border-primary/20 p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[70px] rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 blur-3xl opacity-50" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="font-black text-3xl italic uppercase tracking-tighter text-primary italic text-center">Assign Student to Route</DialogTitle>
                        <p className="text-primary/70 text-[10px] font-mono font-bold uppercase tracking-[0.4em] mt-3 italic text-center italic flex items-center justify-center gap-3 italic">
                            <span className="w-8 h-px bg-primary/30" /> Student Transport Assignment <span className="w-8 h-px bg-primary/30" />
                        </p>
                    </DialogHeader>
                </div>
                
                <div className="p-10 space-y-8 bg-black/40">
                    {/* Student Selection */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1 text-primary/60">Select Student</Label>
                        <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={studentPopoverOpen}
                                    className="w-full justify-between rounded-none bg-primary/5 border-primary/20 h-14 font-black uppercase tracking-tight text-xs hover:bg-primary/10 hover:border-primary/40 transition-all italic text-foreground px-6"
                                    disabled={fetchingStudents}
                                >
                                    <span className="flex items-center gap-3">
                                        <Search className="h-4 w-4 text-primary/50" />
                                        {selectedStudentId
                                            ? `${students.find((s) => s.id === selectedStudentId)?.profile?.first_name} ${students.find((s) => s.id === selectedStudentId)?.profile?.last_name}`
                                            : fetchingStudents ? "LOADING STUDENTS..." : "SELECT STUDENT..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0a0a0a] border border-primary/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-none">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="SEARCH STUDENTS..." className="h-14 border-none focus:ring-0 font-black uppercase italic tracking-widest text-primary placeholder:text-primary/30" />
                                    <CommandList className="scrollbar-none max-h-[300px]">
                                        <CommandEmpty className="py-10 text-center text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] italic">No student found.</CommandEmpty>
                                        <CommandGroup className="p-2">
                                            {students.map((student) => (
                                                <CommandItem
                                                    key={student.id}
                                                    value={`${student.profile?.first_name} ${student.profile?.last_name} ${student.id}`}
                                                    className="py-4 px-6 aria-selected:bg-primary aria-selected:text-primary-foreground transition-all cursor-pointer rounded-none group/item mb-1"
                                                    onSelect={() => {
                                                        setSelectedStudentId(student.id);
                                                        setStudentPopoverOpen(false);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-2 w-2 rounded-full bg-primary group-aria-selected/item:bg-primary-foreground transition-colors animate-pulse" />
                                                            <span className="font-black uppercase tracking-tight text-[12px] italic">{student.profile?.first_name} {student.profile?.last_name}</span>
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "h-4 w-4",
                                                                selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1 text-primary/60">Select Route</Label>
                            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                                <SelectTrigger className="rounded-none bg-primary/5 border-primary/20 h-14 font-black uppercase tracking-tight text-xs hover:bg-primary/10 hover:border-primary/40 transition-all italic text-foreground px-6 focus:ring-0">
                                    <SelectValue placeholder="SELECT ROUTE" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0a] border-primary/30 rounded-none">
                                    {routes.map((route) => (
                                        <SelectItem key={route.id} value={route.id} className="py-4 font-black uppercase tracking-tight text-[11px] italic focus:bg-primary focus:text-primary-foreground">
                                            {route.name} <span className="text-primary/50 group-hover:text-primary-foreground ml-2">[{route.route_number || "---"}]</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic ml-1 text-primary/60">Select Stop</Label>
                            <Select value={selectedStopId} onValueChange={setSelectedStopId} disabled={!selectedRouteId}>
                                <SelectTrigger className="rounded-none bg-primary/5 border-primary/20 h-14 font-black uppercase tracking-tight text-xs hover:bg-primary/10 hover:border-primary/40 transition-all italic text-foreground px-6 focus:ring-0 disabled:opacity-30">
                                    <SelectValue placeholder={selectedRouteId ? "SELECT STOP" : "SELECT ROUTE FIRST"} />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0a] border-primary/30 rounded-none">
                                    {filteredStops.length === 0 ? (
                                        <div className="py-8 px-6 text-[10px] font-black text-red-500/40 uppercase tracking-widest text-center italic">No stops found for this route.</div>
                                    ) : (
                                        filteredStops.map((stop) => (
                                            <SelectItem key={stop.id} value={stop.id} className="py-4 font-black uppercase tracking-tight text-[11px] italic focus:bg-primary focus:text-primary-foreground">
                                                {stop.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedStudentId || !selectedRouteId}
                        className="w-full rounded-none h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] italic shadow-2xl emerald-glow text-xs mt-6 relative overflow-hidden group"
                    >
                        <span className="relative z-10">{loading ? "ASSIGNING..." : "ASSIGN STUDENT"}</span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

}

