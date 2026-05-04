"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "@/lib/auth-utils";

export type StaffMember = {
    id?: string;
    staff_id?: string;
    first_name: string;
    last_name: string;
    father_name: string;
    mother_name?: string;
    gender: "male" | "female" | "other";
    date_of_birth: string;
    marital_status: "single" | "married" | "divorced" | "widowed";
    caste_category?: string;
    highest_qualification: string;
    mother_tongue?: string;
    languages_known?: string[];
    regional_language_proficiency?: string;
    mobile: string;
    email: string;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    date_of_joining: string;
    monthly_salary: number;
    staff_type: "teaching" | "non_teaching";
    department_id: string;
    designation_id: string;
    photo_url?: string;
    aadhar_number?: string;
    pan_number?: string;
    bank_account?: string;
    ifsc_code?: string;
    is_login_enabled: boolean;
    status?: "active" | "inactive" | "on_leave" | "terminated";
};

export async function addStaff(data: StaffMember) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can add staff.");
        }
        const supabase = createAdminClient();

        let userId: string | null = null;

        // 1. Create Auth User if login enabled
        if (data.is_login_enabled) {
            const tempPassword = uuidv4().slice(0, 8); // Simple temp password
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    role: data.staff_type === 'teaching' ? 'teacher' : 'staff',
                    full_name: `${data.first_name} ${data.last_name}`,
                }
            });

            if (authError) {
                return { error: `Auth Error: ${authError.message}` };
            }
            userId = authData.user.id;

            // Create Profile
            await supabase.from("profiles").upsert({
                id: userId,
                full_name: `${data.first_name} ${data.last_name}`,
                email: data.email,
                role: data.staff_type === 'teaching' ? 'teacher' : 'staff',
            });
        }

        // 2. Insert Staff
        const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .insert({
                user_id: userId,
                first_name: data.first_name,
                last_name: data.last_name,
                "father's_name": data.father_name, // Matching the DB column name with quote
                mother_name: data.mother_name,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                marital_status: data.marital_status,
                caste_category: data.caste_category,
                highest_qualification: data.highest_qualification,
                mother_tongue: data.mother_tongue,
                languages_known: data.languages_known,
                regional_language_proficiency: data.regional_language_proficiency,
                mobile: data.mobile,
                email: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                date_of_joining: data.date_of_joining,
                monthly_salary: data.monthly_salary,
                staff_type: data.staff_type,
                department_id: data.department_id,
                designation_id: data.designation_id,
                photo_url: data.photo_url,
                aadhar_number: data.aadhar_number,
                pan_number: data.pan_number,
                bank_account: data.bank_account,
                ifsc_code: data.ifsc_code,
                is_login_enabled: data.is_login_enabled,
                status: "active"
            })
            .select()
            .single();

        if (staffError) {
            console.error("Staff Insert Error:", staffError);
            return { error: `Database Error: ${staffError.message}` };
        }

        revalidatePath("/hr/directory");
        return { success: true, staff: staffData };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function updateStaff(id: string, data: StaffMember) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update staff.");
        }
        const supabase = createAdminClient();

        // 1. Update Staff
        const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .update({
                first_name: data.first_name,
                last_name: data.last_name,
                "father's_name": data.father_name,
                mother_name: data.mother_name,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                marital_status: data.marital_status,
                caste_category: data.caste_category,
                highest_qualification: data.highest_qualification,
                mother_tongue: data.mother_tongue,
                languages_known: data.languages_known,
                regional_language_proficiency: data.regional_language_proficiency,
                mobile: data.mobile,
                email: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                date_of_joining: data.date_of_joining,
                monthly_salary: data.monthly_salary,
                staff_type: data.staff_type,
                department_id: data.department_id,
                designation_id: data.designation_id,
                photo_url: data.photo_url,
                aadhar_number: data.aadhar_number,
                pan_number: data.pan_number,
                bank_account: data.bank_account,
                ifsc_code: data.ifsc_code,
                is_login_enabled: data.is_login_enabled,
                status: data.status || "active",
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (staffError) {
            console.error("Staff Update Error:", staffError);
            return { error: `Database Error: ${staffError.message}` };
        }

        revalidatePath("/hr/directory");
        revalidatePath(`/hr/staff/${id}`);
        return { success: true, staff: staffData };
    } catch (err: any) {
        return { error: err.message };
    }
}

export async function getStaff(filters?: { department_id?: string; staff_type?: string; search?: string }) {
    const supabase = await createClient();
    const adminCheck = await isAdmin();
    let query = supabase
        .from("staff")
        .select(`
            id, staff_id, first_name, last_name, gender, highest_qualification, 
            mobile, email, staff_type, department_id, designation_id, photo_url,
            department:departments(name),
            designation:designations(name)
            ${adminCheck ? ', monthly_salary, bank_account, ifsc_code, pan_number, aadhar_number' : ''}
        `)
        .order("created_at", { ascending: false });

    if (filters?.department_id && filters.department_id !== "all") {
        query = query.eq("department_id", filters.department_id);
    }
    if (filters?.staff_type && filters.staff_type !== "all") {
        query = query.eq("staff_type", filters.staff_type);
    }
    if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,staff_id.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
}

export async function getStaffById(id: string) {
    const supabase = await createClient();
    const adminCheck = await isAdmin();
    
    const { data, error } = await supabase
        .from("staff")
        .select(`
            id, staff_id, first_name, last_name, gender, date_of_birth, marital_status, 
            caste_category, highest_qualification, mother_tongue, languages_known, 
            regional_language_proficiency, mobile, email, address, city, state, pincode, 
            date_of_joining, staff_type, department_id, designation_id, photo_url, 
            aadhar_number, pan_number, bank_account, ifsc_code, status, is_login_enabled,
            "father's_name", mother_name,
            department:departments(name),
            designation:designations(name)
            ${adminCheck ? ', monthly_salary' : ''}
        `)
        .eq("id", id)
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function addDepartment(name: string, code?: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("departments").insert({ name, code }).select().single();
    if (error) return { error: error.message };
    revalidatePath("/hr/add-staff");
    return { data };
}

export async function addDesignation(name: string, department_id?: string, code?: string) {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("designations").insert({ name, department_id, code }).select().single();
    if (error) return { error: error.message };
    revalidatePath("/hr/add-staff");
    return { data };
}

export async function getDepartments() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("departments").select("*").eq("is_active", true).order("name");
    if (error) return { error: error.message };
    return { data };
}

export async function getDesignations() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("designations").select("*").eq("is_active", true).order("name");
    if (error) return { error: error.message };
    return { data };
}
