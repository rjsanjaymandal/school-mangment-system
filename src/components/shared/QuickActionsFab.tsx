"use client";

import { useState } from "react";
import { Plus, X, IndianRupee, UserPlus, GraduationCap, BookOpen, Calendar, ClipboardCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const quickActions = [
  { label: "Add Student", icon: GraduationCap, href: "/students/enroll", color: "bg-emerald-500" },
  { label: "Collect Fee", icon: IndianRupee, href: "/fees", color: "bg-blue-500" },
  { label: "Add Staff", icon: UserPlus, href: "/hr/add-staff", color: "bg-purple-500" },
  { label: "Mark Attendance", icon: ClipboardCheck, href: "/students/attendance", color: "bg-amber-500" },
  { label: "Schedule Exam", icon: BookOpen, href: "/exams", color: "bg-cyan-500" },
  { label: "Send Message", icon: Users, href: "/messages", color: "bg-pink-500" },
];

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAction = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-14 right-0 flex flex-col-reverse gap-3 items-end">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.href)}
              className="flex items-center gap-3 group"
            >
              <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
              </span>
              <div className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-lg hover:scale-105 transition-all ${isOpen ? "rotate-45" : ""}`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}