"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Printer, Search, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  id: string;
  admission_number: string;
  class_id: string;
  profile: { full_name: string };
  class: { name: string };
}

export default function FeeSlipsPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<any>({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [{ data: classData }, { data: settingsData }] = await Promise.all([
        supabase.from("classes").select("id, name").order("name"),
        supabase.from("school_settings").select("key, value")
      ]);
      
      if (classData) setClasses(classData);
      
      if (settingsData) {
        const settings: any = {};
        settingsData.forEach(s => {
          settings[s.key] = s.value;
        });
        setSchoolSettings(settings);
      }

      // Check for studentId in query params
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get("studentId");
      if (studentId) {
        const { data: studentData } = await supabase
          .from("students")
          .select(`
            id,
            admission_number,
            class_id,
            profile:profiles(full_name),
            class:classes(name)
          `)
          .eq("id", studentId)
          .single();

        if (studentData) {
          setStudents([studentData as any]);
          setSelectedStudents([studentData.id]);
        }
      }
    };
    loadData();
  }, [supabase]);

  // Search students
  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        if (!selectedClass) setStudents([]);
        return;
      }
      
      const { data } = await supabase
        .from("students")
        .select(`
          id,
          admission_number,
          class_id,
          profile:profiles(full_name),
          class:classes(name)
        `)
        .or(`admission_number.ilike.%${searchQuery}%,profile.full_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (data) setStudents(data as any);
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedClass, supabase]);

  // Load students by class
  const loadClassStudents = async () => {
    if (!selectedClass) return;
    
    setIsGenerating(true);
    const { data } = await supabase
      .from("students")
      .select(`
        id,
        admission_number,
        class_id,
        profile:profiles(full_name),
        class:classes(name)
      `)
      .eq("class_id", selectedClass);

    if (data) {
      setStudents(data as any);
      setSelectedStudents(data.map((s: any) => s.id));
    }
    setIsGenerating(false);
  };

  const toggleStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(s => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const toggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s: any) => s.id));
    }
  };

  const handleGenerateSlips = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const schoolName = schoolSettings.school_name || "EDU MAYSAN SCHOOL";
      const schoolAddress = schoolSettings.school_address || "Maysan Labs, New Delhi, India";
      const academicYear = schoolSettings.academic_year || "2024-25";

      for (let i = 0; i < selectedStudents.length; i++) {
        if (i > 0) doc.addPage();
        
        const studentId = selectedStudents[i];
        const student = students.find(s => s.id === studentId);
        
        if (!student) continue;

        // Fetch fee assignments and payments for this student
        const [{ data: assignments }, { data: payments }] = await Promise.all([
          supabase.from("fees").select("*").eq("class_id", student.class_id),
          supabase.from("payments").select("*").eq("student_id", studentId).eq("status", "completed")
        ]);

        const totalDue = assignments?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
        const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
        const balance = totalDue - totalPaid;

        // PDF Header
        doc.setFontSize(18);
        doc.setTextColor(16, 185, 129); // Emerald Green
        doc.text(schoolName, 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(schoolAddress, 105, 26, { align: "center" });
        
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 32, 190, 32);

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("FEE INVOICE", 105, 42, { align: "center" });

        // Student Info Box
        doc.setFillColor(248, 250, 252);
        doc.rect(20, 50, 170, 30, "F");
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Student Name:", 25, 60);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text(student.profile?.full_name || "N/A", 55, 60);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("Admission No:", 25, 68);
        doc.setTextColor(30, 41, 59);
        doc.text(student.admission_number || "N/A", 55, 68);

        doc.setTextColor(100);
        doc.text("Class:", 120, 60);
        doc.setTextColor(30, 41, 59);
        doc.text(student.class?.name || "N/A", 145, 60);

        doc.setTextColor(100);
        doc.text("Session:", 120, 68);
        doc.setTextColor(30, 41, 59);
        doc.text(academicYear, 145, 68);

        // Fee Table
        const tableData = assignments?.map(a => [
          a.fee_type || "Tuition Fee",
          `INR ${a.amount.toLocaleString()}`
        ]) || [["No fee items assigned", "0"]];

        autoTable(doc, {
          startY: 90,
          head: [["Description", "Amount"]],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });

        // Summary
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Total Amount Due:", 120, finalY);
        doc.setTextColor(30, 41, 59);
        doc.text(`INR ${totalDue.toLocaleString()}`, 160, finalY, { align: "right" });

        doc.setTextColor(100);
        doc.text("Total Amount Paid:", 120, finalY + 7);
        doc.setTextColor(16, 185, 129);
        doc.text(`INR ${totalPaid.toLocaleString()}`, 160, finalY + 7, { align: "right" });

        doc.setDrawColor(16, 185, 129);
        doc.line(120, finalY + 10, 190, finalY + 10);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        if (balance > 0) {
          doc.setTextColor(225, 29, 72); // Rose Red
        } else {
          doc.setTextColor(16, 185, 129); // Emerald Green
        }
        doc.text("Outstanding Balance:", 120, finalY + 16);
        doc.text(`INR ${balance.toLocaleString()}`, 160, finalY + 16, { align: "right" });

        // Footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("This is a computer generated invoice. No signature required.", 105, 280, { align: "center" });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 285, { align: "center" });
      }

      doc.save(`Fee_Slips_${new Date().getTime()}.pdf`);
      toast.success(`Successfully generated ${selectedStudents.length} fee slips!`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF slips");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-1">
        <span>Home</span>
        <ChevronRight className="h-3 w-3 mx-1" />
        <span>Finance</span>
        <ChevronRight className="h-3 w-3 mx-1" />
        <span className="text-slate-900 dark:text-white font-medium">Fee Slips</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border-l-4 border-emerald-500">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Fee Slip Print</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate and print bulk fee invoices for students</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 space-y-5">
              <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-emerald-500" />
                Filter Students
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Select Class</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={loadClassStudents}
                    disabled={!selectedClass || isGenerating}
                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all w-full mt-2"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : "Load Class Students"}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100 dark:border-slate-800"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">OR</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Search by Name/ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Enter name or admission no..."
                      className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleGenerateSlips}
                  disabled={isGenerating || selectedStudents.length === 0}
                  className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  ) : (
                    <Printer className="h-4 w-4 inline mr-2" />
                  )}
                  Generate {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""} Slips
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Selection List</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedStudents.length} of {students.length} students selected</p>
              </div>
              {students.length > 0 && (
                <button onClick={toggleAll} className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                  {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {students.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No students found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a class or use the search bar to find students</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student: any) => (
                    <div 
                      key={student.id} 
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id) ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                          selectedStudents.includes(student.id) 
                            ? "bg-emerald-600 border-emerald-600" 
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}>
                          {selectedStudents.includes(student.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{student.profile?.full_name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{student.admission_number} • {student.class?.name}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {schoolSettings.academic_year || "2024-25"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
    </svg>
  );
}