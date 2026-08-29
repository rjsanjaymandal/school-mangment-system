"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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
        full_name: formData.full_name,
        role: formData.role
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user identity");

    const userId = authData.user.id;
    const userEmail = authData.user.email || formData.email;

    // 2. Clear and explicit sync to profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: formData.full_name,
        role: formData.role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error("Profile sync failed:", profileError);
      throw profileError;
    }

    revalidatePath("/users");
    return { success: true, message: "Identity and profile provisioned successfully", userId };
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
        full_name: formData.full_name,
        role: formData.role
      }
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
    if (authError) throw authError;

    const profileUpdate: any = {
      full_name: formData.full_name,
      role: formData.role,
      email: formData.email, // Ensure email is synced if it was missing
      updated_at: new Date().toISOString()
    };

    if (typeof formData.is_active === 'boolean') {
      profileUpdate.is_active = formData.is_active;
      profileUpdate.status = formData.is_active ? 'active' : 'inactive';
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (profileError) {
      console.error("Profile update failed:", profileError);
      throw profileError;
    }

    revalidatePath("/users");
    return { success: true, message: "Identity updated successfully" };
  } catch (error: any) {
    console.error("Error updating identity:", error);
    return { success: false, message: error.message || "Failed to update identity" };
  }
}

export async function toggleUserStatusAction(userId: string, isActive: boolean) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, message: "Unauthorized: Admin clearance required" };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_active: isActive,
        status: isActive ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath("/users");
    return { 
      success: true, 
      message: `User status changed to ${isActive ? 'Active' : 'Inactive'}` 
    };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { success: false, message: error.message || "Failed to change user status" };
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

