-- Create index for student_documents to improve search performance
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON public.student_documents (student_id);

-- Ensure first_name and last_name columns exist in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
