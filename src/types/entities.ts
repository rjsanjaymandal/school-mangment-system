// Core Entity Types for Edu Maysan ERP

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deleted_at?: string;
}

// User & Auth
export interface Profile extends BaseEntity {
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active?: boolean;
}

export type UserRole = "admin" | "principal" | "teacher" | "clerk" | "receptionist" | "student" | "parent" | "guardian";

export interface UserRoleAssignment extends BaseEntity {
  user_id: string;
  role: UserRole;
  assigned_by?: string;
}

// Academic
export interface Class extends SoftDeleteEntity {
  name: string;
  section?: string;
  capacity: number;
  room_number?: string;
  teacher_id?: string;
  academic_year_id?: string;
  teacher?: Profile;
}

export interface Student extends SoftDeleteEntity {
  profile_id: string;
  class_id?: string;
  admission_number: string;
  roll_number?: string;
  status: "active" | "inactive" | "transferred" | "graduated";
  profile?: Profile;
  class?: Class;
}

export interface Subject extends SoftDeleteEntity {
  name: string;
  code?: string;
  description?: string;
  credits?: number;
  type?: "core" | "elective" | "optional";
}

export interface Staff extends SoftDeleteEntity {
  profile_id: string;
  employee_id: string;
  designation: string;
  department?: string;
  join_date?: string;
  salary?: number;
  status: "active" | "inactive" | "terminated";
  profile?: Profile;
}

// Fees & Finance
export interface Fee extends SoftDeleteEntity {
  name: string;
  amount: number;
  category: "tuition" | "transport" | "library" | "examination" | "annual" | "other";
  class_id?: string;
  due_date?: string;
  description?: string;
  is_recurring?: boolean;
  academic_year_id?: string;
  class?: Class;
}

export interface Payment extends BaseEntity {
  student_id: string;
  fee_id: string;
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer" | "online" | "upi";
  payment_date: string;
  receipt_number?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_id?: string;
  notes?: string;
  student?: Student;
  fee?: Fee;
}

// Attendance
export interface Attendance extends BaseEntity {
  student_id: string;
  class_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_by?: string;
  notes?: string;
  student?: Student;
}

// Exams & Grades
export interface Exam extends SoftDeleteEntity {
  name: string;
  type: "unit" | "terminal" | "final" | "practice";
  start_date: string;
  end_date: string;
  class_id: string;
  academic_year_id?: string;
  class?: Class;
}

export interface Grade extends BaseEntity {
  student_id: string;
  exam_id: string;
  subject_id: string;
  marks: number;
  grade?: string;
  remarks?: string;
  marked_by?: string;
}

// Health
export interface HealthProfile extends SoftDeleteEntity {
  student_id: string;
  blood_group?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_number?: string;
}

export interface InfirmaryLog extends BaseEntity {
  student_id: string;
  visit_reason: string;
  symptoms?: string;
  treatment_provided?: string;
  medication_given?: string;
  temperature?: number;
  status: "under_observation" | "discharged" | "referral";
  recorded_by?: string;
}

// Conduct
export interface ConductRecord extends BaseEntity {
  student_id: string;
  teacher_id?: string;
  type: "merit" | "demerit";
  points: number;
  category: "discipline" | "academics" | "sports" | "leadership" | "community" | "other";
  description: string;
  incident_date: string;
  student?: Student;
  teacher?: Staff;
}

// Library
export interface Book extends SoftDeleteEntity {
  isbn?: string;
  title: string;
  author?: string;
  publisher?: string;
  category?: string;
  total_copies: number;
  available_copies: number;
}

export interface BookIssue extends BaseEntity {
  student_id: string;
  book_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: "issued" | "returned" | "overdue" | "lost";
}

// Transport
export interface TransportRoute extends SoftDeleteEntity {
  name: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_phone?: string;
  stops?: { name: string; pickup_time: string; drop_time: string }[];
}

export interface TransportAssignment extends BaseEntity {
  student_id: string;
  route_id: string;
  pickup_stop?: string;
  drop_stop?: string;
  status: "active" | "inactive";
}

// Academic Year
export interface AcademicYear extends BaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// Utility types for API responses
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// Form types
export interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  class_id: string;
  admission_number: string;
  roll_number?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  father_name?: string;
  mother_name?: string;
}

export interface FeeFormData {
  name: string;
  amount: number;
  category: Fee["category"];
  class_id?: string;
  due_date: string;
  description?: string;
  is_recurring?: boolean;
}