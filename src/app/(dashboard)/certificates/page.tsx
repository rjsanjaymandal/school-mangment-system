import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import CertificatesDashboardClient from "@/components/certificates/CertificatesDashboardClient";
import { Certificate, Student } from "@/types/database";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  const isStudent = role === "student";
  const isTeacherOrAdmin = role === "admin" || role === "teacher";

  let certQuery = supabase
    .from("certificates")
    .select("*, student:students(*, profile:profiles(*)), issuer:profiles!certificates_issued_by_fkey(*)")
    .order("issued_date", { ascending: false });

  if (isStudent && user) {
    const { data: studentData } = await supabase
      .from("students")
      .select("id")
      .eq("id", user.id)
      .single();
    if (studentData) {
      certQuery = certQuery.eq("student_id", studentData.id);
    } else {
      certQuery = certQuery.eq("student_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: certificates, error: certError } = await certQuery;

  // Fetch all students ONLY for Admin/Teacher for the "Issue Certificate" modal
  let students: any[] = [];
  if (isTeacherOrAdmin) {
    const { data: studentList } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("admission_number");
    students = studentList || [];
  }

  if (certError) {
    console.error("Error fetching certificates:", certError);
  }

  return (
    <CertificatesDashboardClient 
      initialCertificates={(certificates as Certificate[]) || []} 
      students={students as Student[]}
      userRole={role}
    />
  );
}
