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
                    <h3 className="text-lg font-bold text-slate-900">Bus Stops ({routeName})</h3>
                    <p className="text-xs text-slate-500 font-medium">Manage pickup and drop points</p>
                </div>
                <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="rounded-xl bg-slate-900 text-white font-bold gap-x-2">
                            <Plus className="h-4 w-4" /> Add Stop
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-none">
                        <DialogHeader><DialogTitle className="font-black text-2xl">Add Bus Stop</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Stop Name</Label>
                                <Input value={stopForm.name} onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} placeholder="Main Gate" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Pickup Time</Label>
                                    <Input type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Drop Time</Label>
                                    <Input type="time" value={stopForm.drop_time} onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Stop Order</Label>
                                <Input type="number" value={stopForm.stop_order} onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} />
                            </div>
                            <Button onClick={handleAddStop} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                                {loading ? "Adding..." : "Add Stop"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {stops.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 font-medium text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No stops added to this route yet.
                    </div>
                ) : (
                    stops.map((stop) => (
                        <div key={stop.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-x-3">
                                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{stop.name}</p>
                                    <div className="flex items-center gap-x-3 text-[10px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-x-1"><Clock className="h-3 w-3" /> {stop.pickup_time || "--:--"}</span>
                                        <span className="flex items-center gap-x-1"><Clock className="h-3 w-3" /> {stop.drop_time || "--:--"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(stop)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStop(stop.id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isEditStopOpen} onOpenChange={setIsEditStopOpen}>
                <DialogContent className="glass border-none">
                    <DialogHeader><DialogTitle className="font-black text-2xl">Edit Bus Stop</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-400">Stop Name</Label>
                            <Input value={stopForm.name} onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })} placeholder="Main Gate" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Pickup Time</Label>
                                <Input type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Drop Time</Label>
                                <Input type="time" value={stopForm.drop_time} onChange={(e) => setStopForm({ ...stopForm, drop_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-400">Stop Order</Label>
                            <Input type="number" value={stopForm.stop_order} onChange={(e) => setStopForm({ ...stopForm, stop_order: e.target.value })} />
                        </div>
                        <Button onClick={handleUpdateStop} disabled={loading} className="w-full rounded-xl py-6 bg-slate-900 text-white font-bold">
                            {loading ? "Updating..." : "Update Stop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
