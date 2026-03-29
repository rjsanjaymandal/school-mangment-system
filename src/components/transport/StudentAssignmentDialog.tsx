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
            .select("id, profile:profiles(full_name)")
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
                <Button variant="outline" className="h-10 px-6 rounded-md font-bold uppercase tracking-wider text-[11px] border-primary/20 hover:bg-primary/5 transition-all">
                    <UserPlus className="h-4 w-4 mr-2" /> Assign Student
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-0 border-none rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-primary/5 border-b border-border p-10 relative overflow-hidden text-center">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-2xl tracking-tight text-foreground">Assign Student to Route</DialogTitle>
                        <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mt-2 flex items-center justify-center gap-3">
                            <span className="w-8 h-px bg-border" /> Transport Management <span className="w-8 h-px bg-border" />
                        </p>
                    </DialogHeader>
                </div>
                
                <div className="p-10 space-y-8 bg-card">
                    {/* Student Selection */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Select Student</Label>
                        <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                            <PopoverTrigger asChild>
                                 <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={studentPopoverOpen}
                                    className="w-full justify-between rounded-md bg-muted/20 border-border h-12 font-semibold text-xs hover:bg-muted/30 transition-all text-foreground px-4"
                                    disabled={fetchingStudents}
                                >
                                    <span className="flex items-center gap-3">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        {selectedStudentId
                                            ? students.find((s) => s.id === selectedStudentId)?.profile?.full_name
                                            : fetchingStudents ? "Loading..." : "Select Student..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border border-border shadow-xl rounded-lg">
                                <Command className="bg-transparent">
                                    <CommandInput placeholder="Search students..." className="h-12 border-none focus:ring-0 font-semibold text-foreground placeholder:text-muted-foreground/50" />
                                    <CommandList className="scrollbar-none max-h-[300px]">
                                        <CommandEmpty className="py-10 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No student found.</CommandEmpty>
                                         <CommandGroup className="p-2">
                                            {students.map((student) => (
                                                <CommandItem
                                                    key={student.id}
                                                    value={`${student.profile?.full_name} ${student.id}`}
                                                    className="py-3 px-4 aria-selected:bg-primary/10 aria-selected:text-primary transition-all cursor-pointer rounded-md group/item mb-1"
                                                    onSelect={() => {
                                                        setSelectedStudentId(student.id);
                                                        setStudentPopoverOpen(false);
                                                    }}
                                                >
                                                     <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-primary/40 group-aria-selected/item:bg-primary transition-colors" />
                                                            <span className="font-bold text-[13px] tracking-tight">{student.profile?.full_name}</span>
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

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Select Route</Label>
                            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                                <SelectTrigger className="rounded-md bg-muted/20 border-border h-12 font-semibold text-xs hover:bg-muted/30 transition-all text-foreground px-4 focus:ring-0">
                                    <SelectValue placeholder="Select Route" />
                                </SelectTrigger>
                                 <SelectContent className="bg-card border-border rounded-lg">
                                    {routes.map((route) => (
                                        <SelectItem key={route.id} value={route.id} className="py-3 font-semibold text-[11px] focus:bg-primary/10 focus:text-primary">
                                            {route.name} <span className="text-muted-foreground ml-2 opacity-60">[{route.route_number || "---"}]</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Select Stop</Label>
                            <Select value={selectedStopId} onValueChange={setSelectedStopId} disabled={!selectedRouteId}>
                                <SelectTrigger className="rounded-md bg-muted/20 border-border h-12 font-semibold text-xs hover:bg-muted/30 transition-all text-foreground px-4 focus:ring-0 disabled:opacity-40">
                                    <SelectValue placeholder={selectedRouteId ? "Select Stop" : "Select Route First"} />
                                </SelectTrigger>
                                 <SelectContent className="bg-card border-border rounded-lg">
                                    {filteredStops.length === 0 ? (
                                        <div className="py-8 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center italic">No stops found.</div>
                                    ) : (
                                        filteredStops.map((stop) => (
                                            <SelectItem key={stop.id} value={stop.id} className="py-3 font-semibold text-[11px] focus:bg-primary/10 focus:text-primary">
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
                        className="w-full h-14 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-wider transition-all text-xs mt-6"
                    >
                        {loading ? "Assigning..." : "Complete Assignment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

