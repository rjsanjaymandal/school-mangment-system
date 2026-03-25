import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import CertificatesDashboardClient from "@/components/certificates/CertificatesDashboardClient";
import { Certificate, Student } from "@/types/database";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: certificates, error: certError } = await supabase
    .from("certificates")
    .select("*, student:students(*, profile:profiles(*)), issuer:profiles!certificates_issued_by_fkey(*)")
    .order("issued_date", { ascending: false });

  // Fetch all students for the "Issue Certificate" modal
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("admission_number");

  if (certError) {
    console.error("Error fetching certificates:", certError);
  }

  return (
    <CertificatesDashboardClient 
      initialCertificates={(certificates as any[]) || []} 
      students={(students as Student[]) || []}
      currentUserId={user?.id}
      userRole={role}
    />
  );
}
