"use server";

import { isAdminOrTeacher } from "@/lib/auth-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type DocumentPayload = {
    title: string;
    category: string;
    expiry_date?: string;
    file_path?: string;
    file_size?: number;
    version?: number;
    is_encrypted?: boolean;
};

export async function createDocumentArchive(data: DocumentPayload) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can manage compliance documents.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("document_archives")
            .insert({
                ...data,
                version: data.version || 1,
                is_encrypted: data.is_encrypted || false,
            });

        if (error) throw error;
        revalidatePath("/compliance");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateDocumentArchive(id: string, data: Partial<DocumentPayload>) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can manage compliance documents.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("document_archives")
            .update(data)
            .eq("id", id);

        if (error) throw error;
        revalidatePath("/compliance");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteDocumentArchive(id: string) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can manage compliance documents.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("document_archives")
            .delete()
            .eq("id", id);

        if (error) throw error;
        revalidatePath("/compliance");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
