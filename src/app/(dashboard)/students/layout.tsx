import { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Student Management | Edu Maysan",
  description: "Advanced institutional student administration and records.",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 page-fade-in">
      <div className="flex items-center gap-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 reveal-1">
        <span>Personnel</span>
        <span className="opacity-30">/</span>
        <span className="text-primary">Student Management</span>
      </div>
      
      {children}
    </div>
  );
}
