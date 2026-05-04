import { Metadata } from "next";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Personnel</span>
        <span>/</span>
        <span className="text-foreground font-medium">Student Management</span>
      </div>
      {children}
    </div>
  );
}