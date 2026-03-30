-- Class Enrollment table - tracks which class a student belongs to per academic year
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, academic_year_id)
);

-- Class Subjects table - defines which subjects are taught in each class
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id, academic_year_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_academic_year ON class_enrollments(academic_year_id);

CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_academic_year ON class_subjects(academic_year_id);

-- Enable Row Level Security
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_enrollments
DROP POLICY IF EXISTS "Anyone can view class enrollments" ON class_enrollments;
CREATE POLICY "Anyone can view class enrollments" ON class_enrollments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage class enrollments" ON class_enrollments;
CREATE POLICY "Admins can manage class enrollments" ON class_enrollments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for class_subjects
DROP POLICY IF EXISTS "Anyone can view class subjects" ON class_subjects;
CREATE POLICY "Anyone can view class subjects" ON class_subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage class subjects" ON class_subjects;
CREATE POLICY "Admins can manage class subjects" ON class_subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
