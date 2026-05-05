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

  // 1. Fetch Students using React Query
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          profile:profiles(full_name, first_name, last_name),
          class:classes(name)
        `)
        .order("admission_number", { ascending: true });

      if (error) {
        console.error("Error fetching students:", error);
        throw error;
      }

      return (data || []).map((s: any) => ({
        id: s.id,
        admission_number: s.admission_number,
        full_name: s.profile?.first_name 
          ? `${s.profile.first_name} ${s.profile.last_name || ''}`.trim() 
          : (s.profile?.full_name || "Unknown"),
        class_name: s.class?.name || "N/A",
      }));
    }
  });

  // 2. Fetch Documents for Selected Student
  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ['student-documents', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", selectedStudent.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStudent?.id, // Only run when a student is selected
  });

  const filteredStudents = students.filter(
    (s: Student) =>
      (s.admission_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (s.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (s.class_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getDocumentStatus = (docType: string) => {
    return documents.find((d: StudentDocument) => d.doc_type === docType);
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!selectedStudent) return;
    setUploading(docType);
    
    try {
      const filePath = `${selectedStudent.id}/${docType}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("student-docs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("student-docs")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("student_documents")
        .upsert({
          student_id: selectedStudent.id,
          doc_type: docType,
          file_url: fileUrl,
          is_verified: false,
          uploaded_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,doc_type'
        });

      if (dbError) throw dbError;

      // Invalidate query to refetch instantly
      queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (docType: string) => {
    if (!selectedStudent) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this document?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("student_documents")
      .delete()
      .match({ student_id: selectedStudent.id, doc_type: docType });

    if (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete document");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
  };

  const handleVerifyDocument = async (docType: string, verified: boolean) => {
    if (!selectedStudent) return;

    const { error } = await supabase
      .from("student_documents")
      .update({ is_verified: verified })
      .match({ student_id: selectedStudent.id, doc_type: docType });

    if (error) {
      console.error("Error verifying:", error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
  };

  // Virtualized Row Component
  const StudentRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const student = filteredStudents[index];
    const isSelected = selectedStudent?.id === student.id;
    return (
      <div 
        style={style} 
        onClick={() => setSelectedStudent(student)}
        className={`flex flex-col justify-center px-4 cursor-pointer border-b border-dashed hover:bg-emerald-50 transition-colors ${
          isSelected ? "bg-emerald-50" : ""
        }`}
      >
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Personnel</span>
        <span>/</span>
        <span>Student Info</span>
        <span>/</span>
        <span className="text-foreground font-medium">Documents Manager</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Documents Manager</h1>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel - Student Selection (Virtualized) */}
        <div className="w-[40%] flex flex-col">
          <ERPCard className="flex-1 flex flex-col" accentColor="emerald">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Select Student</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 relative">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Adm No., Name, or Class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex-1 overflow-hidden relative">
                {loadingStudents ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found
                  </div>
                ) : (
                  <List
                    style={{ height: 500, width: "100%" }}
                    rowCount={filteredStudents.length}
                    rowHeight={70}
                    rowComponent={StudentRow}
                    rowProps={{} as any}
                  />
                )}
              </div>
            </CardContent>
          </ERPCard>
        </div>

        {/* Right Panel - Manage Documents */}
        <div className="w-[60%]">
          <div className="sticky top-0">
            <ERPCard accentColor="emerald" className="min-h-[600px]">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Manage Documents
                </CardTitle>
                {selectedStudent && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Student: <span className="font-medium text-foreground">{selectedStudent.full_name}</span> 
                    ({selectedStudent.admission_number})
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4">
                {!selectedStudent ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <User className="h-12 w-12 mb-4 opacity-50" />
                    <p>Select a student from the left to manage their documents</p>
                  </div>
                ) : loadingDocuments ? (
                  // Pulse Skeleton Loader
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="border-2 border-slate-100 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-5 w-5 bg-slate-200 rounded-full" />
                          <div className="h-4 w-32 bg-slate-200 rounded-md" />
                        </div>
                        <div className="h-20 bg-slate-100 rounded-md w-full mb-3" />
                        <div className="h-4 w-20 bg-slate-200 rounded-md mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {DOC_TYPES.map((doc) => {
                      const docStatus = getDocumentStatus(doc.key);
                      const isImage = doc.key.includes("photo") || doc.key.includes("signature");
                      const isUploading = uploading === doc.key;

                      return (
                        <div
                          key={doc.key}
                          className={`border-2 border-dashed rounded-lg p-4 ${
                            docStatus?.file_url ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <doc.icon className="h-5 w-5 text-emerald-600" />
                            <span className="font-medium text-sm">{doc.label}</span>
                          </div>

                          {docStatus?.file_url ? (
                            <div className="space-y-3">
                              {isImage && (
                                <div className="relative h-24 w-full rounded-md overflow-hidden bg-slate-100">
                                  <Image
                                    src={docStatus.file_url}
                                    alt={doc.label}
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    onClick={() => setPreviewUrl(docStatus.file_url)}
                                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-md hover:bg-white"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {docStatus.is_verified ? (
                                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex gap-1">
                                  {!docStatus.is_verified && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                      onClick={() => handleVerifyDocument(doc.key, true)}
                                    >
                                      Verify
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => handleDeleteDocument(doc.key)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {isUploading ? (
                                <div className="flex items-center justify-center h-20 bg-slate-50 rounded-md">
                                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                  <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center h-20 bg-slate-50 rounded-md cursor-pointer hover:bg-slate-100 transition-colors">
                                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                  <span className="text-xs text-muted-foreground">Choose File</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept={isImage ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(doc.key, file);
                                    }}
                                  />
                                </label>
                              )}
                              <p className="text-xs text-center text-muted-foreground font-semibold">Missing</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </ERPCard>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Document Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-full h-[60vh]">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}