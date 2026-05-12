-- =====================================================
-- Advanced Demographics Migration
-- Adds caste/religion columns to students + document tracking
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add demographic and institutional columns to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS admission_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS admission_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'
    CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
  ADD COLUMN IF NOT EXISTS religion TEXT DEFAULT 'Not Specified'
    CHECK (religion IN ('Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain', 'Other', 'Not Specified')),
  ADD COLUMN IF NOT EXISTS mother_tongue TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS rte_status BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'dropped', 'alumni'));

-- 2. Auto-ID Generator for Admission Number (ADM-YYYY-XXXX)
CREATE SEQUENCE IF NOT EXISTS admission_number_seq;

CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    seq_val TEXT;
BEGIN
    IF NEW.admission_number IS NULL THEN
        year_str := to_char(CURRENT_DATE, 'YYYY');
        seq_val := lpad(nextval('admission_number_seq')::text, 4, '0');
        NEW.admission_number := 'ADM-' || year_str || '-' || seq_val;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_admission_number ON public.students;
CREATE TRIGGER trg_generate_admission_number
BEFORE INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION generate_admission_number();

-- 3. Student documents tracking table
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'birth_certificate', 'aadhar_card', 'transfer_certificate',
    'previous_marksheet', 'caste_certificate', 'student_photo', 
    'father_photo', 'mother_photo', 'address_proof'
  )),
  file_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, doc_type)
);

-- 4. Enable RLS on student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for authenticated" ON public.student_documents;
CREATE POLICY "Allow read for authenticated"
  ON public.student_documents FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.student_documents;
CREATE POLICY "Allow all for authenticated"
  ON public.student_documents FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Storage Bucket for Student Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-docs',
  'student-docs',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow authenticated users to upload
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "student_docs_upload" ON storage.objects;
CREATE POLICY "student_docs_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-docs');

-- Storage Policy: Allow authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "student_docs_read" ON storage.objects;
CREATE POLICY "student_docs_read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'student-docs');

-- Storage Policy: Allow authenticated users to update/delete
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "student_docs_update" ON storage.objects;
CREATE POLICY "student_docs_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'student-docs')
WITH CHECK (bucket_id = 'student-docs');

DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "student_docs_delete" ON storage.objects;
CREATE POLICY "student_docs_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'student-docs');
