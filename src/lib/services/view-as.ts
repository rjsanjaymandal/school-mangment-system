"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Starts a view-as session for an administrator.
 */
export async function startViewAs(targetUserId: string) {
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
    throw new Error("Unauthorized: Only admins can view as other users.");
  }

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("view_as_user_id", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });

  // Log the view-as event (using existing table)
  await supabase.from("impersonation_logs").insert({
    admin_id: admin.id,
    target_user_id: targetUserId,
    ip_address: "Client-Side",
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
 * Ends the current view-as session.
 */
export async function stopViewAs() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  // Get current admin and target user before clearing
  const { data: { user: admin } } = await supabase.auth.getUser();
  const targetUserId = cookieStore.get("view_as_user_id")?.value;
  
  // Log the stop event
  if (admin && targetUserId) {
    await supabase.from("impersonation_logs").insert({
      admin_id: admin.id,
      target_user_id: targetUserId,
      action: "stop",
      ip_address: "Client-Side",
    });
  }
  
  cookieStore.delete("view_as_user_id");

  redirect("/admin/dashboard");
}