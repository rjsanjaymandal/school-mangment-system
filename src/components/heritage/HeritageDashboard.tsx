"use client";

import { useMemo, useState } from "react";
import { Award, Building2, GraduationCap, Plus, Search, Trash2, Users, Users2 } from "lucide-react";
import { Alumni, Student } from "@/types/database";
import { addAlumnusManual, deleteAlumnus, graduateStudent, updateAlumnus } from "@/app/actions/heritage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AlumniFormState = {
    id?: string;
    first_name: string;
    last_name: string;
    graduation_year: string;
    email: string;
    phone: string;
    current_profession: string;
    company: string;
    achievements: string;
    profile_picture_url: string;
};

const emptyForm: AlumniFormState = {
    first_name: "",
    last_name: "",
    graduation_year: new Date().getFullYear().toString(),
    email: "",
    phone: "",
    current_profession: "",
    company: "",
    achievements: "",
    profile_picture_url: "",
};

export default function HeritageDashboard({
    initialAlumni,
    students,
    userRole,
}: {
    initialAlumni: Alumni[];
    students: Student[];
    userRole?: string | null;
}) {
    const router = useRouter();
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const [searchTerm, setSearchTerm] = useState("");
    const [graduationOpen, setGraduationOpen] = useState(false);
    const [alumniOpen, setAlumniOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
    const [alumniForm, setAlumniForm] = useState<AlumniFormState>(emptyForm);

    const filteredAlumni = useMemo(() => {
        return initialAlumni.filter((alumnus) => {
            const haystack = `${alumnus.first_name} ${alumnus.last_name} ${alumnus.current_profession || ""} ${alumnus.company || ""}`.toLowerCase();
            return haystack.includes(searchTerm.toLowerCase());
        });
    }, [initialAlumni, searchTerm]);

    const handleGraduate = async (formData: FormData) => {
        setIsSubmitting(true);
        const result = await graduateStudent(formData.get("studentId") as string, {
            graduation_year: Number(formData.get("year")),
            current_profession: formData.get("profession") as string,
            company: formData.get("company") as string,
            achievements: formData.get("achievements") as string,
        });
        setIsSubmitting(false);

        if (!result.success) return toast.error(result.message);
        toast.success(result.message);
        setGraduationOpen(false);
        router.refresh();
    };

    const handleSaveAlumnus = async () => {
        if (!alumniForm.first_name || !alumniForm.last_name || !alumniForm.graduation_year) {
            return toast.error("First name, last name, and graduation year are required.");
        }

        setIsSubmitting(true);
        const payload = {
            first_name: alumniForm.first_name,
            last_name: alumniForm.last_name,
            graduation_year: Number(alumniForm.graduation_year),
            email: alumniForm.email || undefined,
            phone: alumniForm.phone || undefined,
            current_profession: alumniForm.current_profession || undefined,
            company: alumniForm.company || undefined,
            achievements: alumniForm.achievements || undefined,
            profile_picture_url: alumniForm.profile_picture_url || undefined,
        };
        const result = editingAlumni
            ? await updateAlumnus(editingAlumni.id, payload)
            : await addAlumnusManual(payload);
        setIsSubmitting(false);

        if (!result.success) return toast.error(result.message);
        toast.success(result.message);
        setEditingAlumni(null);
        setAlumniForm(emptyForm);
        setAlumniOpen(false);
        router.refresh();
    };

    const handleDeleteAlumnus = async (id: string) => {
        if (!confirm("Delete this alumni record?")) return;
        const result = await deleteAlumnus(id);
        if (!result.success) return toast.error(result.message);
        toast.success(result.message);
        router.refresh();
    };

    const openCreateAlumnus = () => {
        setEditingAlumni(null);
        setAlumniForm(emptyForm);
        setAlumniOpen(true);
    };

    const openEditAlumnus = (alumnus: Alumni) => {
        setEditingAlumni(alumnus);
        setAlumniForm({
            id: alumnus.id,
            first_name: alumnus.first_name,
            last_name: alumnus.last_name,
            graduation_year: alumnus.graduation_year.toString(),
            email: alumnus.email || "",
            phone: alumnus.phone || "",
            current_profession: alumnus.current_profession || "",
            company: alumnus.company || "",
            achievements: alumnus.achievements || "",
            profile_picture_url: alumnus.profile_picture_url || "",
        });
        setAlumniOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">Alumni & Heritage</h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">Graduation transitions and alumni records</p>
                </div>
                {isAdminOrTeacher && <div className="flex flex-wrap gap-3">
                    <Dialog open={graduationOpen} onOpenChange={setGraduationOpen}>
                        <DialogTrigger asChild><Button variant="outline">Record Graduation</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Record Graduation</DialogTitle></DialogHeader>
                            <form onSubmit={async (event) => {
                                event.preventDefault();
                                await handleGraduate(new FormData(event.currentTarget));
                            }} className="grid gap-4">
                                <div className="space-y-2"><Label>Student</Label><Select name="studentId"><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{students.map((student) => <SelectItem key={student.id} value={student.id}>{student.profile?.first_name} {student.profile?.last_name} ({student.admission_number})</SelectItem>)}</SelectContent></Select></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Graduation Year</Label><Input name="year" type="number" defaultValue={new Date().getFullYear()} /></div>
                                    <div className="space-y-2"><Label>Profession</Label><Input name="profession" placeholder="Current profession" /></div>
                                </div>
                                <div className="space-y-2"><Label>Company</Label><Input name="company" placeholder="Current company" /></div>
                                <div className="space-y-2"><Label>Achievements</Label><Textarea name="achievements" placeholder="Key achievements" /></div>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Complete Graduation"}</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={alumniOpen} onOpenChange={setAlumniOpen}>
                        <DialogTrigger asChild><Button onClick={openCreateAlumnus}><Plus className="h-4 w-4 mr-2" /> Add Alumni</Button></DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader><DialogTitle>{editingAlumni ? "Edit Alumni" : "Add Alumni"}</DialogTitle></DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>First Name</Label><Input value={alumniForm.first_name} onChange={(e) => setAlumniForm({ ...alumniForm, first_name: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Last Name</Label><Input value={alumniForm.last_name} onChange={(e) => setAlumniForm({ ...alumniForm, last_name: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Graduation Year</Label><Input type="number" value={alumniForm.graduation_year} onChange={(e) => setAlumniForm({ ...alumniForm, graduation_year: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Email</Label><Input value={alumniForm.email} onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Phone</Label><Input value={alumniForm.phone} onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Profession</Label><Input value={alumniForm.current_profession} onChange={(e) => setAlumniForm({ ...alumniForm, current_profession: e.target.value })} /></div>
                                </div>
                                <div className="space-y-2"><Label>Company</Label><Input value={alumniForm.company} onChange={(e) => setAlumniForm({ ...alumniForm, company: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Achievements</Label><Textarea value={alumniForm.achievements} onChange={(e) => setAlumniForm({ ...alumniForm, achievements: e.target.value })} /></div>
                                <Button onClick={handleSaveAlumnus} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingAlumni ? "Update Alumni" : "Create Alumni"}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>}
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Total Alumni</p><h3 className="text-4xl font-bold mt-2">{initialAlumni.length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Active Students</p><h3 className="text-4xl font-bold mt-2">{students.length}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Latest Batch</p><h3 className="text-4xl font-bold mt-2">{initialAlumni[0]?.graduation_year || "NA"}</h3></Card>
                <Card className="p-6 border border-border"><p className="text-xs text-muted-foreground">Employers</p><h3 className="text-4xl font-bold mt-2">{new Set(initialAlumni.map((alumnus) => alumnus.company).filter(Boolean)).size}</h3></Card>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" placeholder="Search alumni..." />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAlumni.length === 0 ? <Card className="p-10 text-center text-muted-foreground col-span-full">No alumni records found.</Card> : filteredAlumni.map((alumnus) => (
                    <Card key={alumnus.id} className="p-6 border border-border">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><GraduationCap className="h-6 w-6" /></div>
                                <div>
                                    <p className="font-semibold text-foreground">{alumnus.first_name} {alumnus.last_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">Class of {alumnus.graduation_year}</Badge>
                                        {alumnus.current_profession && <Badge variant="secondary">{alumnus.current_profession}</Badge>}
                                    </div>
                                </div>
                            </div>
                            {isAdminOrTeacher && <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditAlumnus(alumnus)}>Edit</Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAlumnus(alumnus.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>}
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> {alumnus.company || "No company recorded"}</p>
                            <p className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> {alumnus.achievements || "No achievements recorded"}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-6 border border-border">
                <div className="flex items-center gap-3 mb-3"><Users2 className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold">Transition Intelligence</h3></div>
                <p className="text-sm text-muted-foreground">Graduation recording now moves students into the heritage registry, and the alumni module also supports manual record creation, editing, and cleanup for legacy data.</p>
            </Card>
        </div>
    );
}
