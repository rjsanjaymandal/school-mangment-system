"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Clock } from "lucide-react";
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Bus Stops ({routeName})</h3>
                    <p className="text-xs text-muted-foreground font-medium">Manage pickup and drop points</p>
                </div>
                <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow-sm uppercase tracking-widest text-[9px] px-4 py-1.5 h-auto">
                            <Plus className="h-3 w-3" /> Add Stop
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/90 backdrop-blur-2xl border-border sm:max-w-md rounded-sm shadow-2xl">
                        <DialogHeader><DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight">Add Bus Stop</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Stop Name</Label>
                                <Input value={stopForm.name} onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} placeholder="Main Gate" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Pickup Time</Label>
                                    <Input type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Drop Time</Label>
                                    <Input type="time" value={stopForm.drop_time} onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Stop Order</Label>
                                <Input type="number" value={stopForm.stop_order} onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} />
                            </div>
                            <Button onClick={handleAddStop} disabled={loading} className="w-full rounded-sm py-6 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl emerald-glow text-xs">
                                {loading ? "Adding..." : "Add Stop"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {stops.length === 0 ? (
                    <div className="text-center py-8 text-foreground/30 font-black uppercase tracking-[0.2em] text-[10px] bg-card/20 rounded-sm border-2 border-dashed border-border p-6 shadow-inner">
                        No stops added to this route yet.
                    </div>
                ) : (
                    stops.map((stop) => (
                        <div key={stop.id} className="flex items-center justify-between p-4 rounded-sm bg-background/20 border border-border group hover:border-primary/50 transition-all">
                            <div className="flex items-center gap-x-4">
                                <div className="p-2.5 rounded-sm bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-black text-foreground text-[11px] uppercase tracking-tight">{stop.name}</p>
                                    <div className="flex items-center gap-x-4 text-[9px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">
                                        <span className="flex items-center gap-x-1"><Clock className="h-3 w-3 text-primary/50" /> {stop.pickup_time || "--:--"}</span>
                                        <span className="flex items-center gap-x-1"><Clock className="h-3 w-3 text-red-500/50" /> {stop.drop_time || "--:--"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(stop)} className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xs transition-all">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStop(stop.id)} className="h-8 w-8 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-xs transition-all">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
                <DialogContent className="bg-card/90 backdrop-blur-2xl border-border sm:max-w-md rounded-sm shadow-2xl">
                    <DialogHeader><DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight">Edit Bus Stop</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Stop Name</Label>
                            <Input value={stopForm.name} onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} placeholder="Main Gate" className="rounded-sm bg-background/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Pickup Time</Label>
                                <Input type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} className="rounded-sm bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Drop Time</Label>
                                <Input type="time" value={stopForm.drop_time} onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} className="rounded-sm bg-background/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Stop Order</Label>
                            <Input type="number" value={stopForm.stop_order} onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} className="rounded-sm bg-background/50" />
                        </div>
                        <Button onClick={handleUpdateStop} disabled={loading} className="w-full rounded-sm py-6 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl emerald-glow text-xs">
                            {loading ? "Updating..." : "Update Stop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

