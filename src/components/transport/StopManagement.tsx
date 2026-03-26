"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { addStop, updateStop, deleteStop } from "@/app/actions/transport";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StopManagementProps {
    routeId: string;
    routeName: string;
    stops: any[];
}

export function StopManagement({ routeId, routeName, stops }: StopManagementProps) {
    const router = useRouter();
    const [isAddStopOpen, setIsAddStopOpen] = useState(false);
    const [isEditStopOpen, setIsEditStopOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingStop, setEditingStop] = useState<any>(null);
    const [stopForm, setStopForm] = useState({
        name: "",
        pickup_time: "07:00",
        drop_time: "15:00",
        stop_order: "0",
    });

    const handleAddStop = async () => {
        if (!stopForm.name) return toast.error("Stop name is required");
        setLoading(true);
        const result = await addStop({
            route_id: routeId,
            name: stopForm.name,
            pickup_time: stopForm.pickup_time,
            drop_time: stopForm.drop_time,
            stop_order: parseInt(stopForm.stop_order) || 0,
        });
        setLoading(false);
        if (result.success) {
            setIsAddStopOpen(false);
            setStopForm({ name: "", pickup_time: "07:00", drop_time: "15:00", stop_order: "0" });
            router.refresh();
            toast.success("Stop added successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleUpdateStop = async () => {
        if (!editingStop) return;
        setLoading(true);
        const result = await updateStop(editingStop.id, {
            name: stopForm.name,
            pickup_time: stopForm.pickup_time,
            drop_time: stopForm.drop_time,
            stop_order: parseInt(stopForm.stop_order) || 0,
        });
        setLoading(false);
        if (result.success) {
            setIsEditStopOpen(false);
            setEditingStop(null);
            router.refresh();
            toast.success("Stop updated successfully");
        } else {
            toast.error(result.error);
        }
    };

    const handleDeleteStop = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stop?")) return;
        setLoading(true);
        const result = await deleteStop(id);
        setLoading(false);
        if (result.success) {
            router.refresh();
            toast.success("Stop deleted successfully");
        } else {
            toast.error(result.error);
        }
    };

    const openEdit = (stop: any) => {
        setEditingStop(stop);
        setStopForm({
            name: stop.name,
            pickup_time: stop.pickup_time || "07:00",
            drop_time: stop.drop_time || "15:00",
            stop_order: stop.stop_order?.toString() || "0",
        });
        setIsEditStopOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-primary/10">
                <div className="relative group">
                    <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-primary/50 skew-x-[-12deg]" />
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic pl-2">
                        Bus <span className="text-primary italic">Stops</span>
                    </h3>
                    <p className="text-[9px] text-foreground/40 font-mono font-bold uppercase tracking-[0.2em] italic pl-2 mt-0.5">List of stops for this route</p>
                </div>
                <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="group relative rounded-none h-9 bg-primary/10 hover:bg-primary/20 text-primary font-black px-6 skew-x-[-12deg] transition-all duration-300 border border-primary/20 overflow-hidden">
                            <span className="relative z-10 skew-x-[12deg] flex items-center gap-2 uppercase tracking-tight text-[10px]">
                                <Plus className="h-3.5 w-3.5" /> Add Stop
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 border-none bg-[#050505]/95 backdrop-blur-3xl max-w-md overflow-hidden ring-1 ring-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <div className="bg-primary/10 border-b border-primary/20 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                            <DialogHeader className="relative z-10">
                                <DialogTitle className="font-black text-2xl italic uppercase tracking-tighter text-primary italic text-center text-primary">Add New Stop</DialogTitle>
                                <p className="text-primary/70 text-[9px] font-mono font-bold uppercase tracking-[0.3em] mt-2 italic text-center italic flex items-center justify-center gap-2 italic">
                                    <MapPin className="h-3 w-3 animate-pulse" /> Add a new stop to this route
                                </p>
                            </DialogHeader>
                        </div>
                        <div className="p-8 space-y-6 bg-black/40">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Stop Name</Label>
                                <Input 
                                    value={stopForm.name} 
                                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} 
                                    placeholder="E.G. MAIN GATE" 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Pickup Time</Label>
                                    <Input 
                                        type="time" 
                                        value={stopForm.pickup_time} 
                                        onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} 
                                        className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Drop Time</Label>
                                    <Input 
                                        type="time" 
                                        value={stopForm.drop_time} 
                                        onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} 
                                        className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Stop Order</Label>
                                <Input 
                                    type="number" 
                                    value={stopForm.stop_order} 
                                    onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <Button 
                                onClick={handleAddStop} 
                                disabled={loading} 
                                className="w-full rounded-none h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] italic shadow-xl emerald-glow text-xs mt-4 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{loading ? "SAVING..." : "ADD STOP"}</span>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {stops.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground/30 font-mono text-[10px] uppercase tracking-widest italic border border-dashed border-primary/10">
                        [NO STOPS FOUND]
                    </div>
                ) : (
                    stops.map((stop, idx) => (
                        <div key={stop.id} className="group relative flex items-center justify-between p-6 bg-white/[0.02] border-l-2 border-transparent hover:border-primary hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <span className="text-3xl font-black italic tracking-tighter italic">N-{idx + 1}</span>
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center skew-x-[-12deg] group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-xl group-hover:shadow-primary/50 group-hover:emerald-glow">
                                    <MapPin className={cn(
                                        "h-5 w-5 skew-x-[12deg] transition-all duration-500",
                                        "text-primary group-hover:text-primary-foreground"
                                    )} />
                                </div>
                                <div>
                                    <p className="font-black text-foreground text-sm uppercase tracking-tighter italic group-hover:text-primary transition-colors">{stop.name}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2 group/time">
                                            <Clock className="h-3 w-3 text-primary/50 group-hover/time:text-primary transition-colors" />
                                            <span className="text-[10px] font-mono text-foreground/40 font-bold uppercase tracking-widest italic group-hover/time:text-foreground/80 transition-colors">
                                                IN: {stop.pickup_time || "00:00"}
                                            </span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-white/10" />
                                        <div className="flex items-center gap-2 group/time">
                                            <Clock className="h-3 w-3 text-red-500/50 group-hover/time:text-red-500 transition-colors" />
                                            <span className="text-[10px] font-mono text-foreground/40 font-bold uppercase tracking-widest italic group-hover/time:text-foreground/80 transition-colors">
                                                OUT: {stop.drop_time || "00:00"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(stop)} className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-none transition-all">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStop(stop.id)} className="h-8 w-8 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
                <DialogContent className="p-0 border-none bg-[#050505]/95 backdrop-blur-3xl max-w-md overflow-hidden ring-1 ring-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <div className="bg-primary/10 border-b border-primary/20 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="font-black text-2xl italic uppercase tracking-tighter text-primary italic text-center text-primary">Edit Stop</DialogTitle>
                            <p className="text-primary/70 text-[9px] font-mono font-bold uppercase tracking-[0.3em] mt-2 italic text-center italic flex items-center justify-center gap-2 italic">
                                <Edit2 className="h-3 w-3 animate-pulse" /> Update stop information
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-black/40">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Stop Name</Label>
                            <Input 
                                value={stopForm.name} 
                                onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} 
                                className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Pickup Window</Label>
                                <Input 
                                    type="time" 
                                    value={stopForm.pickup_time} 
                                    onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Drop Window</Label>
                                <Input 
                                    type="time" 
                                    value={stopForm.drop_time} 
                                    onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} 
                                    className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest italic ml-1 text-primary/60">Stop Order</Label>
                            <Input 
                                type="number" 
                                value={stopForm.stop_order} 
                                onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} 
                                className="rounded-none border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary/20 transition-all h-12 font-bold italic"
                            />
                        </div>
                        <Button 
                            onClick={handleUpdateStop} 
                            disabled={loading} 
                            className="w-full rounded-none h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] italic shadow-xl emerald-glow text-xs mt-4 relative overflow-hidden group"
                        >
                            <span className="relative z-10">{loading ? "SAVING..." : "UPDATE STOP"}</span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

    );
}

