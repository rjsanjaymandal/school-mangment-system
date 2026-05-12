"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERPCard } from "@/components/ui/erp-card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Image as ImageIcon,
  User,
  Loader2,
  Trash2,
  Eye,
  PenTool
} from "lucide-react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { List } from "react-window";

interface Student {
  id: string;
  admission_number: string;
  full_name: string;
  class_name: string;
}

interface StudentDocument {
  doc_type: string;
  file_url: string | null;
  is_verified: boolean | null;
  uploaded_at: string | null;
}

const DOC_TYPES = [
  { key: "aadhaar_card", label: "Aadhaar Card", icon: FileText },
  { key: "birth_certificate", label: "Birth Certificate", icon: FileText },
  { key: "previous_marksheet", label: "Previous Marksheet", icon: FileText },
  { key: "transfer_certificate", label: "Transfer Certificate", icon: FileText },
  { key: "student_photo", label: "Student Photo", icon: ImageIcon },
  { key: "signature", label: "Signature", icon: PenTool },
];

export default function StudentDocumentsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: students = [], isLoading: loadingStudents, error: studentsError } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, admission_number")
          .order("admission_number", { ascending: true })
          .limit(200);

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(error.message);
        }

        if (!data || data.length === 0) return [];

        const studentIds = data.map(s => s.id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", studentIds);
          
        const { data: studentClasses } = await supabase.from("students").select("id, class_id").in("id", studentIds);
        const classIds = [...new Set(studentClasses?.map(s => s.class_id).filter(Boolean) || [])];
        const { data: classes } = await supabase.from("classes").select("id, name").in("id", classIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const classMap = new Map(classes?.map(c => [c.id, c.name]) || []);
        const studentClassMap = new Map(studentClasses?.map(s => [s.id, s.class_id]) || []);

        return (data || []).map((s: any) => ({
          id: s.id,
          admission_number: s.admission_number,
          full_name: (() => {
            const p = profileMap.get(s.id);
            if (!p) return "Unknown";
            return `${p.first_name || ''} ${p.last_name || ''}`.trim() || "Unknown";
          })(),
          class_name: classMap.get(studentClassMap.get(s.id)) || "N/A",
        }));
      } catch (err: any) {
        console.error("Error fetching students:", err?.message || err);
        throw err;
      }
    },
    staleTime: 60 * 1000,
    retry: 2,
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ['student-documents', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase.from("student_documents").select("*").eq("student_id", selectedStudent.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStudent?.id,
  });

  const filteredStudents = students.filter((s: Student) =>
    (s.admission_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (s.class_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (docType: string, file: File) => {
    if (!selectedStudent) return;
    setUploading(docType);
    try {
      const filePath = `${selectedStudent.id}/${docType}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("student-docs").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("student-docs").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("student_documents").upsert({
        student_id: selectedStudent.id,
        doc_type: docType,
        file_url: urlData.publicUrl,
        is_verified: false,
        uploaded_at: new Date().toISOString(),
      }, { onConflict: 'student_id,doc_type' });
      if (dbError) throw dbError;
      queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleVerifyDocument = async (docType: string, verified: boolean) => {
    if (!selectedStudent) return;
    const { error } = await supabase.from("student_documents").update({ is_verified: verified }).match({ student_id: selectedStudent.id, doc_type: docType });
    if (error) { console.error("Error verifying:", error); return; }
    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
  };

  interface StudentRowProps { index: number; style: React.CSSProperties; data: { students: Student[]; selectedStudentId: string | undefined; onSelect: (student: Student) => void; }; }
  const StudentRow = ({ index, style, students, selectedStudentId, onSelect }: any) => {
    const student = students[index];
    if (!student) return null;
    const isSelected = selectedStudentId === student.id;
    return (
      <div style={style} onClick={() => onSelect(student)} className={`flex flex-col justify-center px-4 cursor-pointer border-b border-dashed hover:bg-emerald-50 transition-colors ${isSelected ? "bg-emerald-50" : ""}`}>
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-sm font-semibold text-slate-800">{student.full_name}</p>
            <p className="text-xs font-mono text-muted-foreground">{student.admission_number}</p>
          </div>
          <p className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-md">{student.class_name}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Personnel</span>
        <span>/</span>
        <span>Student Info</span>
        <span>/</span>
        <span className="text-foreground font-medium">Documents Manager</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Documents Manager</h1>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        <div className="w-[40%] flex flex-col">
          <ERPCard className="flex-1 flex flex-col" accentColor="emerald">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Select Student</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 relative">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by Adm No., Name, or Class..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex-1 overflow-hidden relative">
                {loadingStudents ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : studentsError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <p className="text-red-500">Error: {studentsError.message}</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <p className="text-muted-foreground">No students found</p>
                  </div>
                ) : (
                  <List
                    style={{ height: 400, width: "100%" }}
                    rowCount={filteredStudents.length}
                    rowHeight={70}
                    rowComponent={StudentRow}
                    rowProps={{
                      students: filteredStudents,
                      selectedStudentId: selectedStudent?.id,
                      onSelect: setSelectedStudent
                    }}
                  />
                )}
              </div>
            </CardContent>
          </ERPCard>
        </div>
        <div className="w-[60%]">
          <div className="sticky top-0">
            <ERPCard accentColor="emerald" className="min-h-[600px]">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Manage Documents
                </CardTitle>
                {selectedStudent && <p className="text-sm text-muted-foreground mt-1">Student: <span className="font-medium text-foreground">{selectedStudent.full_name}</span> ({selectedStudent.admission_number})</p>}
              </CardHeader>
              <CardContent className="p-4">
                {selectedStudent ? (
                  <div className="grid gap-4">
                    {DOC_TYPES.map((doc) => {
                      const docData = documents.find((d: StudentDocument) => d.doc_type === doc.key);
                      const Icon = doc.icon;
                      return (
                        <div key={doc.key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{doc.label}</span>
                            {docData?.is_verified && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Verified</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            {docData?.file_url ? (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(docData.file_url)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleVerifyDocument(doc.key, !docData.is_verified)}>
                                  {docData.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              </>
                            ) : (
                              <div className="relative">
                                <Input type="file" className="hidden" id={`upload-${doc.key}`} onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                                <label htmlFor={`upload-${doc.key}`}>
                                  <Button variant="outline" size="sm" asChild disabled={uploading === doc.key}>
                                    <span><Upload className="h-4 w-4 mr-1" /> Upload</span>
                                  </Button>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">Select a student to manage their documents</div>
                )}
              </CardContent>
            </ERPCard>
          </div>
        </div>
      </div>
      {previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
            <div className="flex justify-end"><Button variant="ghost" onClick={() => setPreviewUrl(null)}><XCircle className="h-4 w-4" /></Button></div>
            <Image src={previewUrl} alt="Preview" width={800} height={600} className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}