"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const BulkStudentSchema = z.array(
    z.object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email"),
        admission_number: z.string().min(1, "Admission number is required"),
        roll_number: z.string().optional(),
        class_id: z.string().optional(),
    })
);

export type BulkStudentRecord = z.infer<typeof BulkStudentSchema>[number];

const BulkTeacherSchema = z.array(
    z.object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email"),
        employee_id: z.string().min(1, "Employee ID is required"),
        specialization: z.string().optional(), // Comma separated in CSV
        qualification: z.string().min(1, "Qualification is required"),
    })
);

export type BulkTeacherRecord = z.infer<typeof BulkTeacherSchema>[number];

export async function bulkImportStudents(students: BulkStudentRecord[]) {
    try {
        const validatedData = BulkStudentSchema.parse(students);
        const supabase = createAdminClient();

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const student of validatedData) {
            try {
                // 1. Create Auth User
                const tempPassword = uuidv4();
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: student.email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        role: "student",
                        first_name: student.first_name,
                        last_name: student.last_name,
                    }
                });

                if (authError) {
                    failCount++;
                    errors.push(`Row ${student.email}: Auth error - ${authError.message}`);
                    continue;
                }

                const userId = authData.user.id;

                // 2. Create Profile
                const { error: profileError } = await supabase.from("profiles").upsert({
                    id: userId,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    email: student.email,
                    role: "student",
                });

                if (profileError) {
                    await supabase.auth.admin.deleteUser(userId);
                    failCount++;
                    errors.push(`Row ${student.email}: Profile error - ${profileError.message}`);
                    continue;
                }

                // 3. Create Student Record
                const studentData: any = {
                    id: userId,
                    admission_number: student.admission_number,
                };
                if (student.roll_number) studentData.roll_number = student.roll_number;
                if (student.class_id) studentData.class_id = student.class_id;

                const { error: studentError } = await supabase.from("students").insert(studentData);

                if (studentError) {
                    await supabase.from("profiles").delete().eq("id", userId);
                    await supabase.auth.admin.deleteUser(userId);
                    failCount++;
                    errors.push(`Row ${student.email}: Student record error - ${studentError.message}`);
                    continue;
                }

                successCount++;
            } catch (innerError: any) {
                failCount++;
                errors.push(`Row ${student.email}: Unexpected error - ${innerError.message}`);
            }
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            total: validatedData.length,
            successCount,
            failCount,
            errors,
        };
    } catch (error: any) {
        console.error("Bulk import failed:", error);
        return { error: error.message || "Bulk import failed" };
    }
}

export async function bulkImportTeachers(teachers: BulkTeacherRecord[]) {
    try {
        const validatedData = BulkTeacherSchema.parse(teachers);
        const supabase = createAdminClient();

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const teacher of validatedData) {
            try {
                // 1. Create Auth User
                const tempPassword = uuidv4();
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: teacher.email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        role: "teacher",
                        first_name: teacher.first_name,
                        last_name: teacher.last_name,
                    }
                });

                if (authError) {
                    failCount++;
                    errors.push(`Row ${teacher.email}: Auth error - ${authError.message}`);
                    continue;
                }

                const userId = authData.user.id;

                // 2. Create Profile
                const { error: profileError } = await supabase.from("profiles").upsert({
                    id: userId,
                    first_name: teacher.first_name,
                    last_name: teacher.last_name,
                    email: teacher.email,
                    role: "teacher",
                });

                if (profileError) {
                    await supabase.auth.admin.deleteUser(userId);
                    failCount++;
                    errors.push(`Row ${teacher.email}: Profile error - ${profileError.message}`);
                    continue;
                }

                // 3. Create Teacher Record
                const specializationArray = teacher.specialization
                    ? teacher.specialization.split(",").map(s => s.trim())
                    : [];

                const { error: teacherError } = await supabase.from("teachers").insert({
                    id: userId,
                    employee_id: teacher.employee_id,
                    specialization: specializationArray,
                    qualification: teacher.qualification,
                    status: "active"
                });

                if (teacherError) {
                    await supabase.from("profiles").delete().eq("id", userId);
                    await supabase.auth.admin.deleteUser(userId);
                    failCount++;
                    errors.push(`Row ${teacher.email}: Teacher record error - ${teacherError.message}`);
                    continue;
                }

                successCount++;
            } catch (innerError: any) {
                failCount++;
                errors.push(`Row ${teacher.email}: Unexpected error - ${innerError.message}`);
            }
        }

        revalidatePath("/teachers");
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            total: validatedData.length,
            successCount,
            failCount,
            errors,
        };
    } catch (error: any) {
        console.error("Bulk import failed:", error);
        return { error: error.message || "Bulk import failed" };
    }
}
