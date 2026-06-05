"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Upload, CheckCircle, XCircle, FileText, 
  Image as ImageIcon, User, Users, Loader2, Eye, 
  PenTool, File, Download, Trash2, FolderOpen, 
  FileUp, CheckCheck, Shield, AlertCircle, Activity,
  BarChart3, LayoutGrid, ShieldCheck
} from "lucide-react";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { ERPCard } from "@/components/ui/erp-card";
import { Progress } from "@/components/ui/progress";

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

export default function StudentDocumentsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      const filePath = `${selectedStudent.id}/${docType}/${crypto.randomUUID()}_${file.name}`;
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
      toast.success("Document Uploaded", { description: `${docType.replace('_', ' ')} saved successfully.` });
    } catch (error) {
      toast.error("Upload Failed", { description: "Could not save the document." });
    } finally {
      setUploading(null);
    }
  };

  const handleVerifyDocument = async (docType: string, verified: boolean) => {
    if (!selectedStudent) return;
    const { error } = await supabase.from("student_documents").update({ is_verified: verified }).match({ student_id: selectedStudent.id, doc_type: docType });
    if (error) { toast.error("Verification Error"); return; }
    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
    toast.success(verified ? "Document Verified" : "Verification Removed");
  };

  const handleDeleteDocument = async (docType: string) => {
    if (!selectedStudent) return;
    if (!confirm("Delete this document?")) return;
    const { error } = await supabase.from("student_documents").delete().match({ student_id: selectedStudent.id, doc_type: docType });
    if (error) { toast.error("Delete Failed"); return; }
    queryClient.invalidateQueries({ queryKey: ['student-documents', selectedStudent.id] });
    toast.success("Document Deleted");
  };

  const docsMap = new Map(documents.map((d: StudentDocument) => [d.doc_type, d]));
  const requiredDocs = DOC_TYPES.filter(d => d.required);
  const requiredUploaded = requiredDocs.filter(d => docsMap.get(d.key)?.file_url).length;
  const completionPercent = requiredDocs.length > 0 ? Math.round((requiredUploaded / requiredDocs.length) * 100) : 100;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Student Documents"
        subtitle="Manage and verify student certificates and IDs"
        icon={FolderOpen}
        color="emerald"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Student Selector Panel */}
        <div className="lg:col-span-4">
          <ERPCard
            title="Student List"
            description="Select a student to manage documents"
            icon={<Users className="h-5 w-5" />}
            color="emerald"
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or admission..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-11 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                />
              </div>
            </div>
            <div className="max-h-[calc(100vh-380px)] overflow-auto divide-y divide-slate-50">
              {loadingStudents ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200 mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-20 text-center">
                  <Activity className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Students Found</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 text-left transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/80",
                      selectedStudent?.id === student.id && "bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-l-emerald-500"
                    )}
                  >
                    <StudentAvatar name={student.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">{student.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">{student.admission_number}</span>
                        <span className="text-slate-200 text-[8px] font-black">/</span>
                        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{student.class_name}</span>
                      </div>
                    </div>
                    {docsMap.get("student_photo") && (
                      <ShieldCheck className="h-4 w-4 text-emerald-500 opacity-50" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ERPCard>
        </div>

        {/* Vault Management Panel */}
        <div className="lg:col-span-8">
          <ERPCard
            title={selectedStudent ? "Document Management" : "Select Student"}
            description={selectedStudent ? `Managing documents for ${selectedStudent.full_name}` : "Choose a student to view their files"}
            icon={<Shield className="h-5 w-5" />}
            color="blue"
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden min-h-[600px]"
          >
            {selectedStudent && (
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 p-1 border-2 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <StudentAvatar name={selectedStudent.full_name} className="w-full h-full rounded-xl" />
                   </div>
                   <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{selectedStudent.full_name}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{selectedStudent.class_name}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                      <span className="text-xs font-black text-emerald-600">{completionPercent}%</span>
                   </div>
                   <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${completionPercent}%` }} />
                   </div>
                </div>
              </div>
            )}

            <div className="p-8">
              {!selectedStudent ? (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
                  <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                    <FileUp className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No Student Selected</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">Select a student from the list to start</p>
                </div>
              ) : loadingDocuments ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {DOC_TYPES.map((doc) => {
                    const docData = docsMap.get(doc.key);
                    const isUploaded = !!docData?.file_url;
                    const isVerified = docData?.is_verified;

                    return (
                      <div
                        key={doc.key}
                        className={cn(
                          "relative group rounded-3xl border-2 p-6 transition-all duration-500",
                          isUploaded 
                            ? isVerified 
                              ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-lg shadow-emerald-500/5" 
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-500/30"
                            : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        {doc.required && (
                          <div className="absolute top-4 right-4">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">Required</span>
                          </div>
                        )}

                        <div className="flex items-start gap-5">
                          <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isUploaded ? "bg-slate-900 text-white rotate-6" : "bg-white border-2 border-slate-100 text-slate-200"
                          )}>
                            <doc.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">{doc.label}</p>
                              {isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                            </div>
                            {isUploaded ? (
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                Uploaded: {new Date(docData.uploaded_at!).toLocaleDateString()}
                              </p>
                            ) : (
                              <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Not Uploaded</p>
                            )}
                          </div>
                        </div>

                        {/* Action Suite */}
                        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100/60">
                          {isUploaded ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={() => setPreviewUrl(docData.file_url)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-2" /> View
                              </Button>
                              <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900" asChild>
                                <a href={docData.file_url || '#'} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3.5 w-3.5 mr-2" /> Download
                                </a>
                              </Button>
                              <div className="flex-1" />
                              <Button 
                                variant={isVerified ? "ghost" : "outline"} 
                                size="sm" 
                                className={cn(
                                    "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    isVerified ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" : "bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 hover:bg-black dark:hover:bg-slate-950"
                                )}
                                onClick={() => handleVerifyDocument(doc.key, !isVerified)}
                              >
                                {isVerified ? <XCircle className="h-3.5 w-3.5 mr-2" /> : <ShieldCheck className="h-3.5 w-3.5 mr-2" />}
                                {isVerified ? "Unverify" : "Verify"}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={() => handleDeleteDocument(doc.key)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="w-full">
                              <input
                                type="file"
                                className="hidden"
                                id={`upload-${doc.key}`}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                                disabled={uploading === doc.key}
                              />
                              <label htmlFor={`upload-${doc.key}`} className="cursor-pointer">
                                <div className="flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 transition-all group/up">
                                  {uploading === doc.key ? (
                                    <Activity className="h-4 w-4 animate-spin text-slate-400" />
                                  ) : (
                                    <FileUp className="h-4 w-4 text-slate-300 group-hover/up:text-slate-600" />
                                  )}
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/up:text-slate-600">Upload File</span>
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
          </ERPCard>
        </div>
      </div>

      {/* Preview Overlay */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-in fade-in duration-300" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">View Document</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reviewing student record</p>
               </div>
               <div className="flex gap-3">
                  <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm" asChild>
                    <a href={previewUrl || '#'} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-950" onClick={() => setPreviewUrl(null)}>
                    <XCircle className="h-6 w-6 text-slate-400" />
                  </Button>
               </div>
            </div>
            <div className="p-10 overflow-auto max-h-[75vh] bg-slate-100/50 dark:bg-slate-800/50 flex justify-center">
              <img src={previewUrl || ''} alt="Preview" className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}