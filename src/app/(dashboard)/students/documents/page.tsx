"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, Upload, CheckCircle, XCircle, FileText, Image as ImageIcon, User, Users, Loader2, Eye, PenTool, File, Download, Trash2, FolderOpen, FileUp, CheckCheck, Shield, AlertCircle } from "lucide-react";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  { key: "aadhaar_card", label: "Aadhaar Card", icon: FileText, required: true, color: "blue" },
  { key: "birth_certificate", label: "Birth Certificate", icon: FileText, required: true, color: "violet" },
  { key: "student_photo", label: "Passport Photo", icon: ImageIcon, required: true, color: "emerald" },
  { key: "transfer_certificate", label: "Transfer Certificate", icon: FileText, required: false, color: "amber" },
  { key: "previous_marksheet", label: "Previous Marksheet", icon: FileText, required: false, color: "cyan" },
  { key: "caste_certificate", label: "Caste Certificate", icon: Shield, required: false, color: "orange" },
  { key: "medical_certificate", label: "Medical Certificate", icon: FileText, required: false, color: "red" },
  { key: "signature", label: "Student Signature", icon: PenTool, required: false, color: "indigo" },
];

const COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", light: "bg-blue-500" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", light: "bg-violet-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", light: "bg-amber-500" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", light: "bg-cyan-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", light: "bg-orange-500" },
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", light: "bg-red-500" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", light: "bg-indigo-500" },
};

export default function StudentDocumentsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students-docs'],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, admission_number, class:classes(name)")
        .order("admission_number", { ascending: true })
        .limit(500);

      if (!data) return [];
      const studentIds = data.map((s: any) => s.id);
      const { data: profiles } = await supabase.from("profiles").select("id, first_name, last_name").in("id", studentIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

      return data.map((s: any) => ({
        id: s.id,
        admission_number: s.admission_number,
        full_name: (() => {
          const p = profileMap.get(s.id);
          return p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : "Unknown";
        })(),
        class_name: s.class?.name || "N/A",
      }));
    },
  });

  const { data: documents = [], isLoading: loadingDocuments } = useQuery({
    queryKey: ['student-documents', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data } = await supabase.from("student_documents").select("*").eq("student_id", selectedStudent.id);
      return data || [];
    },
    enabled: !!selectedStudent?.id,
  });

  const filteredStudents = students.filter((s: Student) =>
    s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (docType: string, file: File) => {
    if (!selectedStudent) return;
    setUploading(docType);
    try {
      const filePath = `${selectedStudent.id}/${docType}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("student-docs").upload(filePath, file);
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
      toast.success("Document uploaded successfully");
      setShowUploadModal(null);
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const handleVerifyDocument = async (docType: string, verified: boolean) => {
    if (!selectedStudent) return;
    const { error } = await supabase.from("student_documents").update({ is_verified: verified }).match({ student_id: selectedStudent.id, doc_type: docType });
    if (error) { toast.error("Failed to verify"); return; }
    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
    toast.success(verified ? "Document verified" : "Verification removed");
  };

  const handleDeleteDocument = async (docType: string) => {
    if (!selectedStudent) return;
    if (!confirm("Delete this document?")) return;
    const { error } = await supabase.from("student_documents").delete().match({ student_id: selectedStudent.id, doc_type: docType });
    if (error) { toast.error("Failed to delete"); return; }
    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
    toast.success("Document deleted");
  };

  const docsMap = new Map(documents.map((d: StudentDocument) => [d.doc_type, d]));
  const requiredDocs = DOC_TYPES.filter(d => d.required);
  const verifiedCount = documents.filter((d: StudentDocument) => d.is_verified).length;
  const uploadedCount = documents.length;
  const requiredUploaded = requiredDocs.filter(d => docsMap.get(d.key)?.file_url).length;
  const completionPercent = requiredDocs.length > 0 ? Math.round((requiredUploaded / requiredDocs.length) * 100) : 100;

  const handleDrop = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(docType, file);
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FolderOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
            <p className="text-sm text-slate-500">Upload and verify student documents</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student List - Left Panel */}
        <Card className="lg:col-span-4 shadow-sm border-0 overflow-hidden">
          <div className="p-5 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h2 className="font-semibold">Students</h2>
                <Badge variant="secondary" className="ml-2">{filteredStudents.length}</Badge>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, admission..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 h-11 bg-slate-50 border-slate-200" 
              />
            </div>
          </div>
          <div className="max-h-[calc(100vh-320px)] overflow-auto">
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm text-slate-500">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <AlertCircle className="h-10 w-10 text-slate-300" />
                <p className="text-slate-500">No students found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-slate-50",
                      selectedStudent?.id === student.id && "bg-emerald-50/70 hover:bg-emerald-50"
                    )}
                  >
                    <StudentAvatar name={student.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-500">{student.admission_number}</span>
                        <span className="text-slate-300">•</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{student.class_name}</Badge>
                      </div>
                    </div>
                    {docsMap.get("student_photo") && selectedStudent?.id === student.id && (
                      <CheckCheck className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Documents Panel - Right */}
        <Card className="lg:col-span-8 shadow-sm border-0 overflow-hidden">
          <div className="p-5 border-b bg-white">
            {selectedStudent ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <StudentAvatar name={selectedStudent.full_name} size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold">{selectedStudent.full_name}</h2>
                    <p className="text-sm text-slate-500">{selectedStudent.admission_number} • {selectedStudent.class_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Completion</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={completionPercent} className="h-2 w-24" />
                      <span className="text-sm font-semibold text-emerald-600">{completionPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                <h2 className="font-semibold">Documents</h2>
              </div>
            )}
          </div>

          <div className="p-5">
            {!selectedStudent ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileUp className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-700">Select a Student</p>
                <p className="text-sm text-slate-500 mt-1">Choose a student from the list to manage their documents</p>
              </div>
            ) : loadingDocuments ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOC_TYPES.map((doc) => {
                  const docData = docsMap.get(doc.key);
                  const isUploaded = !!docData?.file_url;
                  const colors = COLORS[doc.color];

                  return (
                    <div
                      key={doc.key}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => handleDrop(e, doc.key)}
                      className={cn(
                        "group relative rounded-xl border-2 p-5 transition-all",
                        isUploaded 
                          ? docData?.is_verified 
                            ? `border-emerald-300 bg-emerald-50/50 ${colors.bg}` 
                            : `border-slate-200 bg-white hover:border-slate-300`
                          : dragOver 
                            ? `border-emerald-400 bg-emerald-50 ${colors.bg}`
                            : `border-dashed border-slate-200 bg-slate-50/50 hover:${colors.border}`,
                      )}
                    >
                      {/* Required Badge */}
                      {doc.required && (
                        <div className="absolute -top-2 -right-2">
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shadow-sm">Required</Badge>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", isUploaded ? colors.bg : "bg-slate-100")}>
                          <doc.icon className={cn("h-6 w-6", isUploaded ? colors.text : "text-slate-400")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{doc.label}</p>
                            {docData?.is_verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          </div>
                          {docData?.uploaded_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Uploaded {new Date(docData.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100/50">
                        {isUploaded ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setPreviewUrl(docData.file_url)}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5" asChild>
                              <a href={docData.file_url || '#'} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </Button>
                            <div className="flex-1" />
                            <Button 
                              variant={docData?.is_verified ? "ghost" : "default"} 
                              size="sm" 
                              className={cn("h-8 gap-1.5", docData?.is_verified ? "text-emerald-600" : "bg-emerald-600")}
                              onClick={() => handleVerifyDocument(doc.key, !docData?.is_verified)}
                            >
                              {docData?.is_verified ? <XCircle className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
                              {docData?.is_verified ? "Unverify" : "Verify"}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteDocument(doc.key)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <div className="w-full">
                            <input
                              type="file"
                              className="hidden"
                              id={`upload-${doc.key}`}
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                              disabled={uploading === doc.key}
                            />
                            <label htmlFor={`upload-${doc.key}`} className="cursor-pointer">
                              <div className={cn(
                                "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 border-dashed transition-all",
                                colors.border,
                                "hover:border-solid hover:bg-white"
                              )}>
                                {uploading === doc.key ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                <span className="text-sm font-medium">Upload Document</span>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Document Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={previewUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </a>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] bg-slate-100">
              <img src={previewUrl || ''} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}