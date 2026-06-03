"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateStudent } from "@/app/actions/students";
import { ArrowLeft, Save, User, Users, MapPin, Contact, Heart, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  admission_number: string;
  roll_number: string | null;
  status: string;
  category: string;
  religion: string;
  mother_tongue: string;
  rte_status: boolean;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  profile: any;
  class: any;
}

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const [studentId, setStudentId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [formDataSet, setFormDataSet] = useState(false);

  const [isValidUuid, setIsValidUuid] = useState(true);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-edit', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data } = await supabase
        .from("students")
        .select("*, profile:profiles(*), class:classes(name)")
        .eq("id", studentId)
        .single();
      return data as Student;
    },
    enabled: !!studentId
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-all'],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name").order("name");
      return data || [];
    }
  });

  useEffect(() => {
    params.then(p => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(p.id)) {
        setIsValidUuid(false);
      } else {
        setStudentId(p.id);
      }
    });
  }, [params]);

  if (!isValidUuid) {
    notFound();
  }

  useEffect(() => {
    if (student && !formDataSet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        first_name: student.profile?.first_name || "",
        last_name: student.profile?.last_name || "",
        email: student.profile?.email || "",
        phone: student.profile?.phone || "",
        address: student.profile?.address || "",
        admission_number: student.admission_number,
        roll_number: student.roll_number || "",
        class_id: student.class?.id || "",
        gender: student.gender || "male",
        date_of_birth: student.date_of_birth || "",
        blood_group: student.blood_group || "",
        category: student.category || "General",
        religion: student.religion || "Not Specified",
        mother_tongue: student.mother_tongue || "English",
        rte_status: student.rte_status ? "true" : "false",
        status: student.status || "active",
      });
      setFormDataSet(true);
    }
  }, [student]);

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setIsSaving(true);

    try {
      const res = await updateStudent(studentId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        admission_number: formData.admission_number,
        roll_number: formData.roll_number,
        class_id: formData.class_id,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        blood_group: formData.blood_group,
        category: formData.category,
        religion: formData.religion,
        mother_tongue: formData.mother_tongue,
        rte_status: formData.rte_status === "true",
        status: formData.status as any,
        phone: formData.phone,
        address: formData.address,
      });

      if ("error" in res && res.error) {
        toast.error(String(res.error));
      } else {
        toast.success("Student updated successfully", {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
        });
        router.push(`/students/${studentId}`);
      }
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-2">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href={`/students/${studentId}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-3">
            <StudentAvatar name={`${formData.first_name} ${formData.last_name}`} size="lg" />
            <div>
              <h1 className="text-xl font-bold">Edit Student</h1>
              <p className="text-sm text-slate-500 font-mono">{formData.admission_number}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={formData.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}>{formData.status}</Badge>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-emerald-600 gap-2">
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <User className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={formData.first_name} onChange={(e) => updateForm("first_name", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={formData.last_name} onChange={(e) => updateForm("last_name", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => updateForm("email", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => updateForm("phone", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.date_of_birth} onChange={(e) => updateForm("date_of_birth", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => updateForm("gender", v)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={formData.blood_group} onValueChange={(v) => updateForm("blood_group", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => updateForm("status", v)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => updateForm("address", e.target.value)} className="h-11" />
            </div>
          </Card>

          {/* Academic Info */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold">Academic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Admission No.</Label>
                <Input value={formData.admission_number} disabled className="h-11 font-mono bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Roll Number</Label>
                <Input value={formData.roll_number} onChange={(e) => updateForm("roll_number", e.target.value)} className="h-11 font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={formData.class_id} onValueChange={(v) => updateForm("class_id", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => updateForm("category", v)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Religion</Label>
                <Select value={formData.religion} onValueChange={(v) => updateForm("religion", v)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Muslim">Muslim</SelectItem>
                    <SelectItem value="Sikh">Sikh</SelectItem>
                    <SelectItem value="Christian">Christian</SelectItem>
                    <SelectItem value="Not Specified">Not Specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mother Tongue</Label>
                <Select value={formData.mother_tongue} onValueChange={(v) => updateForm("mother_tongue", v)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Punjabi">Punjabi</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Additional Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">RTE Status</span>
                <Badge variant={formData.rte_status === "true" ? "default" : "outline"}>
                  {formData.rte_status === "true" ? "RTE Candidate" : "Non-RTE"}
                </Badge>
              </div>
              <Select value={formData.rte_status} onValueChange={(v) => updateForm("rte_status", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Non-RTE</SelectItem>
                  <SelectItem value="true">RTE Candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/students/${studentId}/documents`}>View Documents</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/students/${studentId}/attendance`}>View Attendance</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/students/${studentId}`}>View Profile</Link>
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}