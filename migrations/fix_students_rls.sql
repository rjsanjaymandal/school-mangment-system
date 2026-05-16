-- Fix RLS policies for students table
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
DROP POLICY IF EXISTS "students_select_all" ON students;
DROP POLICY IF EXISTS "students_insert_all" ON students;
DROP POLICY IF EXISTS "students_update_all" ON students;
DROP POLICY IF EXISTS "students_delete_all" ON students;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON profiles;

DROP POLICY IF EXISTS "classes_select_all" ON classes;

-- Create policies for students
CREATE POLICY "students_select_all" ON students FOR SELECT USING (true);
CREATE POLICY "students_insert_all" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "students_update_all" ON students FOR UPDATE USING (true);

-- Create policies for profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_all" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_insert_all" ON profiles FOR INSERT WITH CHECK (true);

-- Create policy for classes
CREATE POLICY "classes_select_all" ON classes FOR SELECT USING (true);
