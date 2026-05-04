"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "@/lib/auth-utils";

export async function createStudent(data: {
    full_name: string;
    email: string;
    admission_number?: string;
    roll_number?: string;
    class_id?: string;
    category?: string;
    religion?: string;
    mother_tongue?: string;
    rte_status?: boolean;
    admission_date?: string;
}) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can create student records.");
        }
        const supabase = createAdminClient();

        // 1. Create Auth User
        // Note: For students, we might want to generate a random password or use a default one.
        // For now, we'll use a temporary one or let them reset it.
        const tempPassword = uuidv4();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: "student",
                full_name: data.full_name,
            }
        });

        if (authError) {
            console.error("Auth user creation error:", authError);
            return { error: `Failed to create auth user: ${authError.message}` };
        }

        const userId = authData.user.id;

        // 2. Create Profile (if not already created by trigger)
        // We use upsert to handle cases where a trigger might have already created it
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: data.full_name,
            email: data.email,
            role: "student",
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            // Rollback auth user
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create student profile." };
        }

        // 3. Create Student
        const studentData: any = {
            id: userId,
            admission_number: data.admission_number || null, // Let trigger handle it if null
            admission_date: data.admission_date || new Date().toISOString(),
            category: data.category || 'General',
            religion: data.religion || 'Not Specified',
            mother_tongue: data.mother_tongue || 'English',
            rte_status: data.rte_status || false,
            status: 'active'
        };

        if (data.roll_number) studentData.roll_number = data.roll_number;
        if (data.class_id) studentData.class_id = data.class_id;

        const { error: studentError } = await supabase
            .from("students")
            .insert(studentData);

        if (studentError) {
            console.error("Student creation error:", studentError);
            // Rollback
            await supabase.from("profiles").delete().eq("id", userId);
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create student record." };
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating student:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function updateStudent(
    id: string,
    data: {
        full_name: string;
        email: string;
        admission_number: string;
        roll_number?: string;
        class_id?: string;
        category?: string;
        religion?: string;
        mother_tongue?: string;
        rte_status?: boolean;
        status?: 'active' | 'dropped' | 'alumni';
    }
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update student records.");
        }
        const supabase = createAdminClient();

        // 1. Update Auth User (if email changed)
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            email: data.email,
            user_metadata: {
                full_name: data.full_name,
            }
        });

        if (authError) {
            console.error("Auth user update error:", authError);
            // Some error might be because user doesn't exist in auth yet (if created before this fix)
            // So we might allow it to continue if it's just a profile/student record
        }

        // 2. Update Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                full_name: data.full_name,
                email: data.email,
            })
            .eq("id", id);

        if (profileError) {
            console.error("Profile update error:", profileError);
            return { error: "Failed to update student profile." };
        }

        // 3. Update Student
        const studentData: any = {
            admission_number: data.admission_number,
            category: data.category,
            religion: data.religion,
            mother_tongue: data.mother_tongue,
            rte_status: data.rte_status,
            status: data.status,
        };
        if (data.roll_number) studentData.roll_number = data.roll_number;
        if (data.class_id) studentData.class_id = data.class_id;

        const { error: studentError } = await supabase
            .from("students")
            .update(studentData)
            .eq("id", id);

        if (studentError) {
            console.error("Student update error:", studentError);
            return { error: "Failed to update student record." };
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating student:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function deleteStudent(id: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can delete student records.");
        }
        const supabase = createAdminClient();

        // 1. Delete Student
        const { error: studentError } = await supabase
            .from("students")
            .delete()
            .eq("id", id);

        if (studentError) {
            console.error("Student deletion error:", studentError);
            return { error: "Failed to delete student record." };
        }

        // 2. Delete Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);

        if (profileError) {
            console.error("Profile deletion error:", profileError);
            return { error: "Failed to delete student profile." };
        }

        // 3. Delete Auth User
        const { error: authError } = await supabase.auth.admin.deleteUser(id);

        if (authError) {
            console.error("Auth user deletion error:", authError);
            // Non-blocking if auth user is already gone
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting student:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function getClassCapacity(classId: string) {
    try {
        const supabase = createAdminClient();
        
        const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("capacity")
            .eq("id", classId)
            .single();

        if (classError) throw classError;

        const { count: currentCount, error: countError } = await supabase
            .from("students")
            .select("*", { count: 'exact', head: true })
            .eq("class_id", classId);

        if (countError) throw countError;

        return {
            success: true,
            capacity: classData?.capacity || null,
            currentCount: currentCount || 0,
            available: classData?.capacity ? classData.capacity - (currentCount || 0) : null
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignStudentToClass(
    studentId: string,
    classId: string,
    academicYearId?: string
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can assign students to classes.");
        }
        const supabase = createAdminClient();

        // Check class capacity
        const capacityInfo = await getClassCapacity(classId);
        if (capacityInfo.success && capacityInfo.capacity !== null && capacityInfo.available !== null && capacityInfo.available !== undefined) {
            if (capacityInfo.available <= 0) {
                return { success: false, error: `Class is at full capacity (${capacityInfo.capacity} students). Cannot assign more students.` };
            }
        }

        // Update student class
        const { error: updateError } = await supabase
            .from("students")
            .update({ class_id: classId })
            .eq("id", studentId);

        if (updateError) throw updateError;

        // If academic year provided, could also create a class_enrollment record
        if (academicYearId) {
            const { error: enrollmentError } = await supabase
                .from("class_enrollments")
                .upsert({
                    student_id: studentId,
                    class_id: classId,
                    academic_year_id: academicYearId,
                    enrolled_at: new Date().toISOString()
                }, { onConflict: 'student_id,academic_year_id' });
            
            if (enrollmentError) {
                console.warn("Enrollment record creation warning:", enrollmentError);
            }
        }

        revalidatePath("/students");
        revalidatePath("/classes");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkAssignStudentsToClass(
    studentIds: string[],
    classId: string,
    academicYearId?: string
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can assign students to classes.");
        }
        
        if (!studentIds || studentIds.length === 0) {
            return { success: false, error: "No students selected." };
        }

        const supabase = createAdminClient();

        // Check class capacity
        const capacityInfo = await getClassCapacity(classId);
        if (capacityInfo.success && capacityInfo.capacity !== null && capacityInfo.available !== null && capacityInfo.available !== undefined) {
            if (studentIds.length > capacityInfo.available) {
                return { success: false, error: `Not enough capacity. Class has ${capacityInfo.available} spots left, but ${studentIds.length} students selected.` };
            }
        }

        // Bulk update students
        const { error: updateError } = await supabase
            .from("students")
            .update({ class_id: classId })
            .in("id", studentIds);

        if (updateError) throw updateError;

        // Create enrollment records if academic year provided
        if (academicYearId) {
            const enrollmentRecords = studentIds.map(studentId => ({
                student_id: studentId,
                class_id: classId,
                academic_year_id: academicYearId,
                enrolled_at: new Date().toISOString()
            }));

            const { error: enrollmentError } = await supabase
                .from("class_enrollments")
                .upsert(enrollmentRecords, { onConflict: 'student_id,academic_year_id' });
            
            if (enrollmentError) {
                console.warn("Enrollment records creation warning:", enrollmentError);
            }
        }

        revalidatePath("/students");
        revalidatePath("/classes");
        revalidatePath("/admin/dashboard");
        return { success: true, assignedCount: studentIds.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentsByClass(classId: string) {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("students")
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq("class_id", classId)
            .order("roll_number", { ascending: true });

        if (error) throw error;

        return { success: true, students: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, students: [] };
    }
}

export async function getUnassignedStudents(academicYearId?: string) {
    try {
        const supabase = createAdminClient();

        const query = supabase
            .from("students")
            .select(`
                *,
                profile:profiles(*)
            `)
            .is("class_id", null)
            .order("profile:full_name", { ascending: true });

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, students: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, students: [] };
    }
}
