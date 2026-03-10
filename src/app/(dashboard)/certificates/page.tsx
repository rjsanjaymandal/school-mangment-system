import { createClient } from "@/lib/supabase/server";
import CertificatesDashboardClient from "@/components/certificates/CertificatesDashboardClient";

export default async function CertificatesPage() {
  const supabase = await createClient();

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select("*, student:students(*, profile:profiles(*)), issuer:profiles!certificates_issued_by_fkey(*)")
    .order("issued_date", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
  }

  return <CertificatesDashboardClient initialCertificates={certificates || []} />;
}
