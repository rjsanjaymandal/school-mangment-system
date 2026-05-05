import { createClient } from "@/lib/supabase/server";
import { toast } from "sonner";

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: role,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    
    return { success: true, message: "Role updated successfully" };
  } catch (error: any) {
    console.error("Error updating role:", error);
    return { success: false, error: error.message };
  }
}

export async function resetUserAccess(userId: string) {
  const supabase = await createClient();
  
  try {
    // Delete the user role
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Optionally reset the staff login info
    // This would require additional logic depending on requirements

    return { success: true, message: "Access reset successfully" };
  } catch (error: any) {
    console.error("Error resetting access:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data?.role || null;
  } catch {
    return null;
  }
}

export async function getAllUserRoles(): Promise<Record<string, string>> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (error) return {};
    
    return Object.fromEntries((data || []).map((ur) => [ur.user_id, ur.role]));
  } catch {
    return {};
  }
}