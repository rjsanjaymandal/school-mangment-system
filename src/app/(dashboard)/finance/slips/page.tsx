"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Printer, Download, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ERPCard } from "@/components/ui/erp-card";
import { useFinanceStore } from "@/lib/store/finance-store";

interface Student {
  id: string;
  admission_number: string;
  class_id: string;
  profile: { full_name: string };
  class: { name: string };
}

export default function FeeSlipsPage() {
  const supabase = createClient();
  const { activeSession } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load classes
  useState(() => {
    const loadClasses = async () => {
      const { data } = await supabase.from("classes").select("id, name").order("name");
      if (data) setClasses(data);
    };
    loadClasses();
  });

  // Search students
  useState(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        setStudents([]);
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
  });

  // Load students by class
  const loadClassStudents = async () => {
    if (!selectedClass) return;
    
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
      alert("Please select at least one student");
      return;
    }

    setIsGenerating(true);
    
    // Simulate slip generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Generated ${selectedStudents.length} fee slips for session ${activeSession}`);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <FileText className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Fee Slip Print</h1>
          <p className="text-sm text-slate-500">Generate bulk invoices for students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Class Selection */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Select by Class</h3>
            <div className="space-y-3">
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button 
                onClick={loadClassStudents}
                disabled={!selectedClass}
                variant="outline"
                className="w-full rounded-md"
              >
                Load Students
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <Label className="text-sm font-medium text-slate-600">Search Individual</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or admission..."
                className="pl-10 rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <div className="text-center mb-3">
              <p className="text-sm text-slate-500">{selectedStudents.length} student(s) selected</p>
            </div>
            <Button
              onClick={handleGenerateSlips}
              disabled={isGenerating || selectedStudents.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-md"
            >
              {isGenerating ? (
                <>
                  <Printer className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Fee Slips
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Student List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="p-4 border-b border-slate-100 border-l-4 border-l-emerald-500 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Student List</h3>
                <p className="text-xs text-slate-500">Select students to generate fee slips</p>
              </div>
              {students.length > 0 && (
                <Button variant="outline" size="sm" onClick={toggleAll} className="rounded-md text-xs">
                  {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>
            
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {students.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a class or search for students</p>
                </div>
              ) : (
                students.map((student: any) => (
                  <div 
                    key={student.id} 
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                      selectedStudents.includes(student.id) ? "bg-emerald-50" : ""
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student.profile?.full_name}</p>
                        <p className="text-xs text-slate-500">{student.admission_number} • {student.class?.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activeSession}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="mt-4 bg-white border border-slate-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Preview</h3>
            <div className="border border-dashed border-slate-200 rounded-md p-8 text-center text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Fee slip preview will appear here</p>
              <p className="text-xs mt-1">Student name, class, fee heads, amount, due date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}