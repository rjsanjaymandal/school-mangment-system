"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, User, BookOpen, IndianRupee, Award, AlertCircle,
  CheckCircle, FileText, GraduationCap, Calendar
} from "lucide-react";

interface Activity {
  id: string;
  type: "attendance" | "payment" | "grade" | "admission" | "notice" | "exam";
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

const ACTIVITIES: Activity[] = [
  { id: "1", type: "payment", title: "Fee Payment Received", description: "₹15,000 received from Rahul Sharma (Class 10-A)", timestamp: "2 min ago", icon: IndianRupee, color: "text-emerald-500 bg-emerald-50" },
  { id: "2", type: "attendance", title: "Attendance Marked", description: "Morning attendance completed for Class 10-A", timestamp: "15 min ago", icon: CheckCircle, color: "text-blue-500 bg-blue-50" },
  { id: "3", type: "grade", title: "Exam Results Uploaded", description: "Unit Test - Term 1 marks uploaded for Class 12", timestamp: "1 hour ago", icon: Award, color: "text-purple-500 bg-purple-50" },
  { id: "4", type: "admission", title: "New Admission", description: "New student enrolled: Aryan Singh (Class 9-B)", timestamp: "2 hours ago", icon: GraduationCap, color: "text-amber-500 bg-amber-50" },
  { id: "5", type: "notice", title: "Notice Published", description: "Parent-Teacher Meeting scheduled for May 15", timestamp: "3 hours ago", icon: FileText, color: "text-slate-500 bg-slate-50" },
  { id: "6", type: "exam", title: "Exam Schedule Updated", description: "Final exam timetable published for Class 10", timestamp: "4 hours ago", icon: BookOpen, color: "text-orange-500 bg-orange-50" },
  { id: "7", type: "attendance", title: "Attendance Alert", description: "15 students below 75% attendance threshold", timestamp: "5 hours ago", icon: AlertCircle, color: "text-red-500 bg-red-50" },
  { id: "8", type: "payment", title: "Fee Reminder Sent", description: "Automated reminders sent to 23 families", timestamp: "6 hours ago", icon: IndianRupee, color: "text-amber-500 bg-amber-50" },
];

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "attendance", label: "Attendance" },
  { value: "payment", label: "Payments" },
  { value: "grade", label: "Grades" },
  { value: "admission", label: "Admissions" },
  { value: "notice", label: "Notices" },
  { value: "exam", label: "Exams" },
];

export function ActivityTimeline() {
  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPE_FILTERS.map(filter => (
          <button
            key={filter.value}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
              filter.value === "all" 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
        
        <div className="space-y-4">
          {ACTIVITIES.map(activity => (
            <div key={activity.id} className="relative pl-10">
              <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white ${activity.color.split(" ")[1]} ${activity.color.split(" ")[0]} flex items-center justify-center`}>
                <activity.icon className={`h-2.5 w-2.5 ${activity.color.split(" ")[0]}`} />
              </div>
              
              <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center pt-2">
        <button className="text-sm text-emerald-600 font-medium hover:underline">
          Load More Activities →
        </button>
      </div>
    </div>
  );
}