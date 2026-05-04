import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth-utils";

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getSessionRole();
  
  if (role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}