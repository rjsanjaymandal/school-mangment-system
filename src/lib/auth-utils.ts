import { createClient } from "./supabase/server";

export async function getSessionRole() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || !profile) return null;
    return profile.role;
}

export async function isAdminOrTeacher() {
    const role = await getSessionRole();
    return role === "admin" || role === "teacher";
}

export async function isAdmin() {
    const role = await getSessionRole();
    return role === "admin";
}
