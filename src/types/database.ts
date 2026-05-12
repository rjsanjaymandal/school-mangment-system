export type ActionResult<T = unknown> = 
    | { success: true; data?: T }
    | { success: false; error: string | unknown };

export type ClassRecord = {
    id: string;
    name: string;
    capacity: number | null;
    room_number: string | null;
    teacher_id: string | null;
    grade_level: string | null;
    academic_year_id: string;
    created_at: string;
};

export type StudentRecord = {
    id: string;
    admission_number: string | null;
    roll_number: string | null;
    class_id: string | null;
    category: string;
    religion: string;
    mother_tongue: string;
    rte_status: boolean;
    gender: string;
    date_of_birth: string | null;
    blood_group: string | null;
    status: 'active' | 'dropped' | 'alumni';
    admission_date: string;
    created_at: string;
    class?: ClassRecord;
    profile?: ProfileRecord;
};

export type ProfileRecord = {
    id: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    created_at: string;
};

export type AttendanceRecord = {
    id: string;
    student_id: string;
    class_id: string;
    date: string;
    status: string;
    remarks: string | null;
    marked_by: string;
};

export type SubjectRecord = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    credits: number | null;
    syllabus: string | null;
    created_at: string;
};

export type ClassSubjectRecord = {
    id: string;
    class_id: string;
    subject_id: string;
};

export type TeacherRecord = {
    id: string;
    user_id: string;
    employee_number: string | null;
    employee_id: string | null;
    qualification: string | null;
    specialization: string | string[] | null;
    specialization_list?: string[];
    date_of_joining: string | null;
    join?: string;
    status: string;
    profile?: ProfileRecord;
};

export type FeeRecord = {
    id: string;
    name: string;
    amount: number;
    class_id: string | null;
    academic_year_id: string;
    due_date: string;
    status: 'pending' | 'paid' | 'waived';
};

export type ExamRecord = {
    id: string;
    name: string;
    class_id: string;
    subject_id: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
};

export type ResultRecord = {
    id: string;
    student_id: string;
    exam_id: string;
    marks: number;
    grade: string | null;
    remarks: string | null;
};

export type PayrollRecord = {
    id: string;
    staff_id: string;
    base_salary: number;
    bonuses: number;
    deductions: number;
    month: number;
    year: number;
    status: 'pending' | 'paid';
};

export type LibraryRecord = {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    quantity: number;
    available: number;
};

export type InventoryRecord = {
    id: string;
    name: string;
    quantity_in_stock: number;
    unit_price: number;
    category_id: string | null;
    sku: string | null;
};

export type TransportRecord = {
    id: string;
    vehicle_number: string;
    driver_name: string;
    route: string | null;
    capacity: number;
};

export type TimetableRecord = {
    id: string;
    class_id: string;
    day_of_week: string;
    period: number;
    subject_id: string | null;
    teacher_id: string | null;
    room_number: string | null;
    start_time: string;
    end_time: string;
};

export type HealthProfileRecord = {
    id: string;
    student_id: string;
    blood_group: string | null;
    allergies: string[];
    chronic_conditions: string[];
    medications: string[];
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
};

export type ActivityRecord = {
    id: string;
    name: string;
    type: string;
    category: string;
    date: string;
    conducted_by: string | null;
    venue: string | null;
    description: string | null;
    max_participants: number | null;
};

export type CertificateRecord = {
    id: string;
    student_id: string;
    certificate_type: string;
    issue_date: string;
    issued_by: string | null;
    file_url: string | null;
};

export type GuardianRecord = {
    id: string;
    student_id: string;
    name: string;
    relation: string;
    phone: string | null;
    email: string | null;
    occupation: string | null;
};

export type AcademicYearRecord = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
};

export type ClassEnrollmentRecord = {
    id: string;
    student_id: string;
    class_id: string;
    academic_year_id: string;
    enrolled_at: string;
};

export type AlumniRecord = {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    passout_year: number;
    graduation_year: number;
    current_profession: string | null;
    company: string | null;
    phone: string | null;
    email: string | null;
    achievements: string | null;
    profile_picture_url: string | null;
    is_verified: boolean;
};

export type Student = StudentRecord;
export type Class = ClassRecord;
export type Activity = ActivityRecord;
export type Certificate = CertificateRecord;
export type Teacher = TeacherRecord;
export type Alumni = AlumniRecord;
export type Subject = SubjectRecord;