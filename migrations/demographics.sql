-- =====================================================
-- Advanced Demographics Migration
-- Adds caste/religion columns to students + document tracking
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add demographic columns to students table
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'
    CHECK (category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
  ADD COLUMN IF NOT EXISTS religion TEXT DEFAULT 'Not Specified'
    CHECK (religion IN ('Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain', 'Other', 'Not Specified'));

-- 2. Student documents tracking table
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'birth_certificate', 'aadhar_card', 'transfer_certificate',
    'mark_sheet', 'caste_certificate', 'photo', 'address_proof'
  )),
  file_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, doc_type)
);

-- 3. Enable RLS on student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for authenticated" ON public.student_documents;
CREATE POLICY "Allow read for authenticated"
  ON public.student_documents FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON public.student_documents;
CREATE POLICY "Allow all for authenticated"
  ON public.student_documents FOR ALL
  USING (auth.role() = 'authenticated');
