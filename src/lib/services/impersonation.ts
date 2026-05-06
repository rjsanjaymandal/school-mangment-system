"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuditService } from "./audit";

export async function startImpersonation(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();

  if (!admin) throw new Error("Authentication required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", admin.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can impersonate.");
  }

  const cookieStore = await cookies();
  cookieStore.set("impersonation_user_id", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1, // 1 hour
  });

  await AuditService.logAction(supabase, {
    actor_id: admin.id,
    action: "SHADOW_START",
    entity_type: "user",
    entity_id: targetUserId,
    new_data: { target_id: targetUserId }
  });

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  const targetRole = targetProfile?.role || "student";
  redirect(`/${targetRole}/dashboard`);
}

export async function stopImpersonation() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  const { data: { user: admin } } = await supabase.auth.getUser();
  const impersonationId = cookieStore.get("impersonation_user_id")?.value;
  
  if (admin && impersonationId) {
    await AuditService.logAction(supabase, {
      actor_id: admin.id,
      action: "SHADOW_STOP",
      entity_type: "user",
      entity_id: impersonationId,
    });
  }
  
  cookieStore.delete("impersonation_user_id");
  redirect("/admin/dashboard");
}
