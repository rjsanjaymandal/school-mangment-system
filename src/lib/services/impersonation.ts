"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Starts an impersonation session for an administrator.
 */
export async function startImpersonation(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();

  if (!admin) throw new Error("Authentication required");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", admin.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can impersonate.");
  }

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("impersonation_user_id", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // Log the impersonation event
  await supabase.from("impersonation_logs").insert({
    admin_id: admin.id,
    target_user_id: targetUserId,
    ip_address: "Client-Side", // Ideal to capture via headers if possible
  });

  // Fetch target user role for redirection
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  const targetRole = targetProfile?.role || "student";

  redirect(`/${targetRole}/dashboard`);
}

/**
 * Ends the current impersonation session.
 */
export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonation_user_id");

  // Update log if needed (Optional: find last open log for this admin)
  
  redirect("/admin/dashboard");
}
