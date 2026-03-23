"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function provisionUser(formData: any) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 1. Create the Auth User
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

    if (!authData.user) {
      throw new Error("Failed to create user identity");
    }

    const userId = authData.user.id;

    // 2. Update the profile (or insert if triggers didn't run)
    // Note: Depends on whether there is an auth trigger automatically creating the profile.
    // We use upsert to handle both cases safely.
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

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Ensure we don't leave orphaned auth records if this is critical,
      // but for simplicity we throw here.
      throw new Error("User identity created, but profile update failed: " + profileError.message);
    }

    revalidatePath("/users");
    
    return { 
      success: true, 
      message: "Identity provisioned successfully", 
      userId 
    };
  } catch (error: any) {
    console.error("Error provisioning identity:", error);
    return { 
      success: false, 
      message: error.message || "An unexpected error occurred during provisioning" 
    };
  }
}

export async function updateIdentity(userId: string, formData: any) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Update auth user if password is provided
    if (formData.password) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: formData.password }
      );
      if (authError) throw authError;
    }

    // Update profile
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
  try {
    const supabaseAdmin = createAdminClient();
    
    // Auth user must be deleted first, or cascade handles it.
    // In Supabase, deleting auth.users cascades to public.profiles if configured.
    // If not, we should delete the profile explicitly. Let's delete profile then auth user.
    console.log(`Deleting identity: ${userId}`);

    // Try deleting profile first (safeguard)
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
      
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
        throw new Error(`Failed to delete Auth User: ${authError.message}`);
    }

    revalidatePath("/users");
    return { success: true, message: "Identity deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting identity:", error);
    return { success: false, message: error.message || "Failed to delete identity" };
  }
}
