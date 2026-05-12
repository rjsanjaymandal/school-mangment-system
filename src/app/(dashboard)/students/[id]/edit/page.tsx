"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    GraduationCap, Save, ArrowLeft, Info, 
    Users, MapPin, Contact, FileText, CheckCircle2 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/client";
import { updateStudent } from "@/app/actions/students";
import Link from "next/link";

export default function EditStudentPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        admission_number: "",
        roll_number: "",
        class_id: "",
        gender: "male",
        date_of_birth: "",
        blood_group: "",
        category: "General",
        religion: "Not Specified",
        mother_tongue: "English",
        rte_status: "false",
        status: "active" as any,
        phone: "",
        address: ""
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient();
                const [student, classRes] = await Promise.all([
                    InstitutionalService.getStudentById(id, supabase),
                    supabase.from("classes").select("id, name").order("name")
                ]);

                if (classRes.data) setClasses(classRes.data);

                if (student) {
                    setFormData({
                        first_name: student.profile?.first_name || "",
                        last_name: student.profile?.last_name || "",
                        email: student.profile?.email || "",
                        admission_number: student.admission_number || "",
                        roll_number: student.roll_number || "",
                        class_id: student.class_id || "",
                        gender: student.gender || "male",
                        date_of_birth: student.date_of_birth || "",
                        blood_group: student.blood_group || "",
                        category: student.category || "General",
                        religion: student.religion || "Not Specified",
                        mother_tongue: student.mother_tongue || "English",
                        rte_status: String(student.rte_status),
                        status: student.status || "active",
                        phone: student.profile?.phone || "",
                        address: student.profile?.address || ""
                    });
                }
            } catch (error) {
                toast.error("Failed to fetch student data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const res = await updateStudent(id, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                admission_number: formData.admission_number,
                roll_number: formData.roll_number,
                class_id: formData.class_id,
                category: formData.category,
                religion: formData.religion,
                mother_tongue: formData.mother_tongue,
                rte_status: formData.rte_status === "true",
                gender: formData.gender,
                date_of_birth: formData.date_of_birth,
                blood_group: formData.blood_group,
                status: formData.status,
                phone: formData.phone,
                address: formData.address
            });

            if (res && "error" in res && res.error) {
                toast.error(String(res.error));
            } else {
                toast.success("Student Updated Successfully");
                router.push(`/students/${id}`);
            }
        } catch (error) {
            toast.error("Critical failure during record synchronization.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center text-slate-500">Loading student data from central registry...</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-md">
                        <Link href={`/students/${id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Edit Student Record</h1>
                        <p className="text-sm text-slate-500">Updating profile for {formData.first_name} {formData.last_name}</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Update Record"}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <ERPCard title="Administrative Details" accentColor="emerald" icon={<Info className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Admission Number</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.admission_number}
                                onChange={(e) => setFormData(p => ({ ...p, admission_number: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Roll Number</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.roll_number}
                                onChange={(e) => setFormData(p => ({ ...p, roll_number: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Assigned Class</Label>
                            <Select 
                                value={formData.class_id}
                                onValueChange={(v) => setFormData(p => ({ ...p, class_id: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    {classes.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ERPCard>

                <ERPCard title="Personal Information" accentColor="blue" icon={<Users className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">First Name</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.first_name}
                                onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Last Name</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.last_name}
                                onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Gender</Label>
                            <Select 
                                value={formData.gender}
                                onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            <Select 
                                value={formData.blood_group}
                                onValueChange={(v) => setFormData(p => ({ ...p, blood_group: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Date of Birth</Label>
                            <Input 
                                type="date"
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                            />
                        </div>
                    </div>
                </ERPCard>

                <ERPCard title="Demographics" accentColor="slate" icon={<FileText className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Category</Label>
                            <Select 
                                value={formData.category}
                                onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                            >
                                <SelectTrigger className="h-12 rounded-md bg-white border-slate-200">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="OBC">OBC</SelectItem>
                                    <SelectItem value="SC">SC</SelectItem>
                                    <SelectItem value="ST">ST</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Religion</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.religion}
                                onChange={(e) => setFormData(p => ({ ...p, religion: e.target.value }))}
                            />
                        </div>
                    </div>
                </ERPCard>
                
                <ERPCard title="Contact Details" accentColor="slate" icon={<Contact className="h-4 w-4" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Email Address</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Phone Number</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium text-slate-600">Permanent Address</Label>
                            <Input 
                                className="h-12 rounded-md bg-white border-slate-200"
                                value={formData.address}
                                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </ERPCard>
            </form>
        </div>
    );
}
