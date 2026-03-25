"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-utils";

export async function provisionUser(formData: any) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, message: "Unauthorized: Admin clearance required" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user identity");

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    revalidatePath("/users");
    return { success: true, message: "Identity provisioned successfully", userId };
  } catch (error: any) {
    console.error("Error provisioning identity:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
}

export async function updateIdentity(userId: string, formData: any) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, message: "Unauthorized: Admin clearance required" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    // 1. Update auth user (metadata and password)
    const updateData: any = {
      user_metadata: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role
      }
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
    if (authError) throw authError;

    // 2. Update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    revalidatePath("/users");
    return { success: true, message: "Identity updated successfully" };
  } catch (error: any) {
    console.error("Error updating identity:", error);
    return { success: false, message: error.message || "Failed to update identity" };
  }
}

export async function deleteIdentity(userId: string) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, message: "Unauthorized: Admin clearance required" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    // Cascading delete should handle profiles if configured, but we do explicit for safety
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    revalidatePath("/users");
    return { success: true, message: "Identity deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting identity:", error);
    return { success: false, message: error.message || "Failed to delete identity" };
  }
}
