"use client";

import { useState } from "react";
import { Check, X, Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class, Student } from "@/types/database";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface AttendanceFormProps {
  classes: Class[];
}

export function AttendanceForm({ classes }: AttendanceFormProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchStudents = async (classId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .eq("class_id", classId);

    if (data) {
      setStudents(data.map((s) => ({ ...s, status: "present" })));
    }
    setLoading(false);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    fetchStudents(val);
  };

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s,
      ),
    );
  };

  const handleSave = () => {
    toast.success(`Attendance for ${students.length} students recorded!`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Select Class & Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-600">Class</label>
            <Select onValueChange={handleClassChange}>
              <SelectTrigger className="bg-slate-50 border-none">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-600">Date</label>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-slate-50 border-none"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {new Date().toLocaleDateString()}
            </Button>
          </div>
          <Button disabled={!selectedClass} className="gap-x-2">
            <Search className="h-4 w-4" />
            Check List
          </Button>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card className="border-none shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Student List (
              {students.filter((s) => s.status === "present").length}/
              {students.length} Present)
            </CardTitle>
            <Button onClick={handleSave} size="sm">
              Save Attendance
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {student.profile?.first_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {student.profile?.first_name}{" "}
                        {student.profile?.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Roll No: {student.roll_number || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Button
                      size="sm"
                      variant={
                        student.status === "present" ? "default" : "outline"
                      }
                      className={
                        student.status === "present"
                          ? "bg-green-600 hover:bg-green-700"
                          : "text-slate-400"
                      }
                      onClick={() => toggleStatus(student.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Present
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        student.status === "absent" ? "default" : "outline"
                      }
                      className={
                        student.status === "absent"
                          ? "bg-red-600 hover:bg-red-700"
                          : "text-slate-400"
                      }
                      onClick={() => toggleStatus(student.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
