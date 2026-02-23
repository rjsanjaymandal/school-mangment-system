import { z } from "zod";

// --- Profile & Authentication ---
export const userRoleSchema = z.enum(['admin', 'teacher', 'student', 'parent']);

export const profileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  role: userRoleSchema,
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// --- Academic Structure ---
export const academicYearSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(4),
  start_date: z.string(),
  end_date: z.string(),
  is_current: z.boolean(),
});

export const classSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  grade_level: z.string().optional(),
  academic_year_id: z.string().uuid(),
});

export const subjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().toUpperCase(),
  description: z.string().optional().nullable(),
});

// --- Finance & HR ---
export const feeStructureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  amount: z.number().positive(),
  academic_year_id: z.string().uuid(),
  due_date: z.string(),
});

export const payrollSchema = z.object({
  id: z.string().uuid(),
  staff_id: z.string().uuid(),
  base_salary: z.number().positive(),
  bonuses: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
  month: z.number().min(1).max(12),
  year: z.number(),
  status: z.enum(['pending', 'paid']),
});

// --- Timetable & Logistics ---
export const timetableSlotSchema = z.object({
  id: z.string().uuid().optional(),
  timetable_id: z.string().uuid(),
  subject_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  room_number: z.string().optional().nullable(),
});

// --- Behavioral & Performance ---
export const studentConductSchema = z.object({
  id: z.string().uuid().optional(),
  student_id: z.string().uuid(),
  teacher_id: z.string().uuid().optional().nullable(),
  type: z.enum(['merit', 'demerit']),
  points: z.number().int().min(1).max(100),
  category: z.enum(['Discipline', 'Academics', 'Sports', 'Leadership']),
  description: z.string().optional().nullable(),
  incident_date: z.string(),
});

// --- Security & Audit ---
export const auditLogSchema = z.object({
  id: z.string().uuid().optional(),
  actor_id: z.string().uuid().optional().nullable(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  old_data: z.any().optional(),
  new_data: z.any().optional(),
});

// --- Compliance ---
export const documentArchiveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  category: z.enum(['Legal', 'Academic', 'HR', 'Financial']),
  file_path: z.string(),
  uploaded_by: z.string().uuid().optional(),
  expiry_date: z.string().optional().nullable(),
  version: z.number().int().default(1),
  is_encrypted: z.boolean().default(true),
});

// --- Wellness & Health ---
export const healthProfileSchema = z.object({
  id: z.string().uuid(),
  blood_group: z.string().optional().nullable(),
  allergies: z.array(z.string()).optional(),
  chronic_conditions: z.array(z.string()).optional(),
  vaccinations: z.array(z.object({
    name: z.string(),
    date: z.string(),
    status: z.string(),
  })).optional(),
  medications: z.array(z.string()).optional(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
});

export const infirmaryLogSchema = z.object({
  id: z.string().uuid().optional(),
  student_id: z.string().uuid(),
  recorded_by: z.string().uuid().optional().nullable(),
  visit_reason: z.string().min(1),
  symptoms: z.string().optional().nullable(),
  treatment_provided: z.string().optional().nullable(),
  medication_given: z.string().optional().nullable(),
  temperature: z.number().optional().nullable(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional().nullable(),
  status: z.enum(['under_observation', 'discharged', 'referral']),
});

// --- Inventory & Procurement ---
export const inventoryItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  quantity_in_stock: z.number().int().nonnegative(),
  unit_price: z.number().positive(),
  category_id: z.string().uuid().optional().nullable(),
  sku: z.string().optional(),
});

export const procurementOrderSchema = z.object({
  id: z.string().uuid().optional(),
  item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  total_cost: z.number().nonnegative(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']),
  order_date: z.string().optional(),
});

// TYPES derived from Zod
export type ValidProfile = z.infer<typeof profileSchema>;
export type ValidTimetableSlot = z.infer<typeof timetableSlotSchema>;
export type ValidStudentConduct = z.infer<typeof studentConductSchema>;
export type ValidHealthProfile = z.infer<typeof healthProfileSchema>;
export type ValidInfirmaryLog = z.infer<typeof infirmaryLogSchema>;
