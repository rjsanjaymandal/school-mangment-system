"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== BUS ROUTES =====

export async function createRoute(data: {
    name: string;
    route_number?: string;
    driver_name?: string;
    driver_phone?: string;
    plate_number?: string;
    capacity?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("bus_routes").insert(data);
        if (error) throw error;
        revalidatePath("/transport");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoute(id: string, data: Partial<{
    name: string;
    route_number: string;
    driver_name: string;
    driver_phone: string;
    plate_number: string;
    capacity: number;
    status: string;
}>) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("bus_routes").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/transport");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoute(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("bus_routes").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/transport");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== BUS STOPS =====

export async function addStop(data: {
    route_id: string;
    name: string;
    pickup_time?: string;
    drop_time?: string;
    stop_order?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("bus_stops").insert(data);
        if (error) throw error;
        revalidatePath("/transport");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== STUDENT TRANSPORT ASSIGNMENT =====

export async function assignStudentTransport(data: {
    student_id: string;
    route_id: string;
    stop_id?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("student_transport")
            .upsert(data, { onConflict: "student_id" });
        if (error) throw error;
        revalidatePath("/transport");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
