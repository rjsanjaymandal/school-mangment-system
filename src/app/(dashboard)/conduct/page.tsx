"use client";

import { useEffect, useState } from "react";
import { ConductService } from "@/lib/services/conduct";
import { InstitutionalService } from "@/lib/services/institutional";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import {
  ShieldAlert,
  Star,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  History,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function BehavioralDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [behaviorHistory, setBehaviorHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [incidentType, setIncidentType] = useState<"merit" | "demerit">(
    "merit",
  );
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentPoints, setIncidentPoints] = useState<number | string>("");
  const [incidentCategory, setIncidentCategory] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const studentData = await InstitutionalService.getStudents();
        setStudents(studentData);
        if (studentData.length > 0) {
          setSelectedStudent(studentData[0]);
        }
      } catch (error) {
        console.error("Failed to init conduct dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedStudent?.id) {
      const fetchStudentDetails = async () => {
        const [history, stats] = await Promise.all([
          ConductService.getStudentBehaviorHistory(selectedStudent.id),
          ConductService.getBehavioralAnalytics(selectedStudent.id),
        ]);
        setBehaviorHistory(history);
        setAnalytics(stats);
      };
      fetchStudentDetails();
    }
  }, [selectedStudent]);

  if (loading) return <DashboardSkeleton />;
  const handleRecord = async () => {
    if (!selectedStudent) return;

    try {
      const result = await ConductService.recordConduct({
        student_id: selectedStudent.id,
        type: incidentType,
        points: Number(incidentPoints) || 5,
        incident_date: new Date().toISOString().split("T")[0],
        description: incidentDescription || "No description provided",
        category:
          (incidentCategory as
            | "Discipline"
            | "Academics"
            | "Sports"
            | "Leadership") || "Academics",
        teacher_id: "teacher-uuid-placeholder", // Should come from auth
      });

      if (result) {
        toast.success(
          `${incidentType === "merit" ? "Merit" : "Demerit"} recorded successfully!`,
        );
        setIsRecording(false);
        setIncidentDescription("");
        setIncidentPoints("");
        // Refresh analytics and history
        const [history, stats] = await Promise.all([
          ConductService.getStudentBehaviorHistory(selectedStudent.id),
          ConductService.getBehavioralAnalytics(selectedStudent.id),
        ]);
        setBehaviorHistory(history);
        setAnalytics(stats);
      }
    } catch (error) {
      console.error("Failed to record incident:", error);
      toast.error("Failed to record incident.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Conduct Intelligence (BID)
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Meritocratic Behavioral Tracking & Automated Intervention
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <History className="h-4 w-4" />
            Audit Logs
          </Button>
          <Button
            className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue"
            onClick={() => {
              setIncidentType("merit");
              setIsRecording(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Record Incident
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Statistics Overview */}
        <Card variant="futuristic" className="p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="h-24 w-24 rotate-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Total Merits
          </p>
          <h3 className="text-3xl font-black mt-2 text-white">
            {analytics?.merits?.toString().padStart(2, "0") || "00"}
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-400">
            <TrendingUp className="h-4 w-4" />
            Active Standings
          </div>
        </Card>

        <Card variant="glass" className="p-6 border-red-500/20 bg-red-500/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
            Total Demerits
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">
            {analytics?.demerits?.toString().padStart(2, "0") || "00"}
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-red-400">
            <ShieldAlert className="h-4 w-4" />
            {analytics?.demerits > 20 ? "Intervention Required" : "System Safe"}
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Net Conduct Score
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">
            {analytics?.netScore || "0"}
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">
            Behavioral Velocity
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Standing
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900 truncate">
            {analytics?.standing || "Pending"}
          </h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-500">
            {analytics?.netScore > 50 ? "Star Recognition" : "Standard Tier"}
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Student Directory */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search student conduct records..."
              className="pl-9 rounded-2xl border-slate-100 h-12"
            />
          </div>
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={cn(
                  "w-full p-4 rounded-2xl border border-transparent transition-all flex items-center justify-between text-left",
                  selectedStudent?.id === student.id
                    ? "bg-white shadow-xl border-slate-100 scale-[1.02]"
                    : "hover:bg-white/50",
                )}
              >
                <div className="flex items-center gap-x-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {student.profile?.first_name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {student.profile?.first_name} {student.profile?.last_name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {student.class?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Behavior Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none glass futuristic-card overflow-hidden">
            <div className="h-32 bg-slate-900 relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20" />
              <div className="absolute -bottom-8 left-8 flex items-end gap-x-4">
                <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-2xl">
                  <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center font-black text-3xl text-slate-900 uppercase">
                    {selectedStudent?.profile?.first_name[0]}
                  </div>
                </div>
                <div className="pb-4">
                  <h3 className="text-2xl font-black text-white drop-shadow-md">
                    {selectedStudent?.profile?.first_name}{" "}
                    {selectedStudent?.profile?.last_name}
                  </h3>
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-[10px]">
                    {analytics?.standing?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="mt-12 p-8 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Accumulated Merits
                  </p>
                  <h4 className="text-2xl font-black text-green-600">
                    {analytics?.merits || 0}
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Total Demerits
                  </p>
                  <h4 className="text-2xl font-black text-red-600">
                    {analytics?.demerits || 0}
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase mb-1">
                    Behavior Percentile
                  </p>
                  <h4 className="text-2xl font-black text-blue-600">
                    {analytics?.netScore > 0 ? "Top 15%" : "Lower 50%"}
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">
                    Recent Conduct Feed
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-black text-blue-500"
                  >
                    VIEW FULL HISTORY
                  </Button>
                </div>
                <div className="space-y-3">
                  {behaviorHistory.length > 0 ? (
                    behaviorHistory.slice(0, 3).map((record) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-slate-50 transition-all"
                      >
                        <div className="flex gap-x-4">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center",
                              record.type === "merit"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600",
                            )}
                          >
                            {record.type === "merit" ? (
                              <Star className="h-5 w-5" />
                            ) : (
                              <ShieldAlert className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900">
                              {record.category}
                            </h5>
                            <p className="text-xs text-slate-500 max-w-[200px] truncate">
                              {record.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="futuristic"
                            className={
                              record.type === "merit"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }
                          >
                            {record.type === "merit" ? "+" : "-"}
                            {record.points}
                          </Badge>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                            {new Date(
                              record.incident_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No Recent Activity
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setIncidentType("merit");
                    setIsRecording(true);
                  }}
                  className="h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black gap-x-2 shadow-xl shadow-green-100 border-none"
                >
                  <UserCheck className="h-5 w-5" />
                  ISSUE MERIT
                </Button>
                <Button
                  onClick={() => {
                    setIncidentType("demerit");
                    setIsRecording(true);
                  }}
                  className="h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black gap-x-2 shadow-xl shadow-red-100 border-none"
                >
                  <ShieldAlert className="h-5 w-5" />
                  LOG DEMERIT
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Incident Modal Overlay */}
      {isRecording && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none glass shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader
              className={cn(
                "p-6 text-white flex flex-row items-center justify-between",
                incidentType === "merit" ? "bg-green-600" : "bg-red-600",
              )}
            >
              <div className="flex items-center gap-x-3">
                {incidentType === "merit" ? (
                  <Star className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
                <CardTitle className="text-xl font-black">
                  {incidentType === "merit"
                    ? "Award Institutional Merit"
                    : "Record Conduct Violation"}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRecording(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Student Subject
                </label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-900">
                  {selectedStudent?.profile?.first_name}{" "}
                  {selectedStudent?.profile?.last_name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Category
                  </label>
                  <Select
                    onValueChange={setIncidentCategory}
                    defaultValue="Academics"
                  >
                    <SelectTrigger className="rounded-xl border-slate-100 h-12 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="Discipline">Discipline</SelectItem>
                      <SelectItem value="Academics">Academics</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">
                    Point Value
                  </label>
                  <Input
                    type="number"
                    value={incidentPoints}
                    onChange={(e) => setIncidentPoints(e.target.value)}
                    placeholder="5"
                    className="rounded-xl border-slate-100 h-12 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  Incident Description
                </label>
                <Textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Describe the behavior or incident in detail..."
                  className="rounded-xl border-slate-100 min-h-[120px] font-medium"
                />
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex gap-x-3">
              <Button
                variant="outline"
                onClick={() => setIsRecording(false)}
                className="flex-1 h-12 rounded-xl font-bold border-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecord}
                className={cn(
                  "flex-1 h-12 rounded-xl font-black text-white shadow-lg border-none",
                  incidentType === "merit"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                CONFIRM & LOG
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
