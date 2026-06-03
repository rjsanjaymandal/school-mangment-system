"use client";

import { useMemo, useState } from "react";
import { Award, Building2, GraduationCap, Plus, Search, Trash2, Users, Users2 } from "lucide-react";
import { Alumni, Student } from "@/types/database";
import { addAlumnusManual, deleteAlumnus, graduateStudent, updateAlumnus } from "@/app/actions/alumni";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

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

export default function AlumniDashboard({
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <UnifiedPageHeader
                title="Alumni & Heritage"
                subtitle="Graduation transitions and alumni records"
                icon={GraduationCap}
                actions={
                    isAdminOrTeacher && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setGraduationOpen(true)}
                                className="h-10 rounded-xl border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 transition-all"
                            >
                                Record Graduation
                            </button>
                            <button
                                onClick={openCreateAlumnus}
                                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all"
                            >
                                <Plus className="h-4 w-4 inline mr-2" /> Add Alumni
                            </button>
                        </div>
                    )
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Alumni" value={initialAlumni.length} icon={Users} color="blue" description="Registered alumni" />
                <DashboardStatCard title="Active Students" value={students.length} icon={GraduationCap} color="emerald" description="Current enrollment" />
                <DashboardStatCard title="Latest Batch" value={initialAlumni[0]?.graduation_year || "NA"} icon={Award} color="amber" description="Most recent class" />
                <DashboardStatCard title="Employers" value={new Set(initialAlumni.map((alumnus) => alumnus.company).filter(Boolean)).size} icon={Building2} color="purple" description="Unique employers" />
            </div>

            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 rounded-xl border-slate-200" placeholder="Search alumni..." />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredAlumni.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                        <p className="text-sm font-bold text-slate-500">No alumni records found.</p>
                    </div>
                ) : (
                    filteredAlumni.map((alumnus) => (
                        <div key={alumnus.id} className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{alumnus.first_name} {alumnus.last_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200">Class of {alumnus.graduation_year}</span>
                                            {alumnus.current_profession && (
                                                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">{alumnus.current_profession}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isAdminOrTeacher && (
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditAlumnus(alumnus)} className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">Edit</button>
                                        <button onClick={() => handleDeleteAlumnus(alumnus.id)} className="h-8 w-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Building2 className="h-4 w-4" /> {alumnus.company || "No company recorded"}
                                </p>
                                <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Award className="h-4 w-4" /> {alumnus.achievements || "No achievements recorded"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                    <Users2 className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Transition Intelligence</h3>
                </div>
                <p className="text-sm text-slate-500">Graduation recording now moves students into the heritage registry, and the alumni module also supports manual record creation, editing, and cleanup for legacy data.</p>
            </div>

            {/* Graduation Modal */}
            {graduationOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-slate-900">Record Graduation</h3>
                            <button onClick={() => setGraduationOpen(false)} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={async (event) => { event.preventDefault(); await handleGraduate(new FormData(event.currentTarget)); }} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Student</label>
                                <select name="studentId" className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none">
                                    <option value="">Select student</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>{student.profile?.first_name} {student.profile?.last_name} ({student.admission_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Graduation Year</label>
                                    <Input name="year" type="number" defaultValue={new Date().getFullYear()} className="rounded-xl border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Profession</label>
                                    <Input name="profession" placeholder="Current profession" className="rounded-xl border-slate-200" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Company</label>
                                <Input name="company" placeholder="Current company" className="rounded-xl border-slate-200" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Achievements</label>
                                <textarea name="achievements" placeholder="Key achievements" className="w-full h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none resize-none" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {isSubmitting ? "Processing..." : "Complete Graduation"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Alumni Modal */}
            {alumniOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-slate-900">{editingAlumni ? "Edit Alumni" : "Add Alumni"}</h3>
                            <button onClick={() => { setAlumniOpen(false); setEditingAlumni(null); }} className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">First Name</label>
                                    <Input value={alumniForm.first_name} onChange={(e) => setAlumniForm({ ...alumniForm, first_name: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Last Name</label>
                                    <Input value={alumniForm.last_name} onChange={(e) => setAlumniForm({ ...alumniForm, last_name: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Graduation Year</label>
                                    <Input type="number" value={alumniForm.graduation_year} onChange={(e) => setAlumniForm({ ...alumniForm, graduation_year: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email</label>
                                    <Input value={alumniForm.email} onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Phone</label>
                                    <Input value={alumniForm.phone} onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Profession</label>
                                    <Input value={alumniForm.current_profession} onChange={(e) => setAlumniForm({ ...alumniForm, current_profession: e.target.value })} className="rounded-xl border-slate-200" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Company</label>
                                <Input value={alumniForm.company} onChange={(e) => setAlumniForm({ ...alumniForm, company: e.target.value })} className="rounded-xl border-slate-200" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Achievements</label>
                                <textarea value={alumniForm.achievements} onChange={(e) => setAlumniForm({ ...alumniForm, achievements: e.target.value })} className="w-full h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none resize-none" />
                            </div>
                            <button onClick={handleSaveAlumnus} disabled={isSubmitting} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                {isSubmitting ? "Saving..." : editingAlumni ? "Update Alumni" : "Create Alumni"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}