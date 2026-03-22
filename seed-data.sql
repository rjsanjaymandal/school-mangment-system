-- =====================================================
-- EduFox School ERP — Comprehensive Seed Data
-- Provisions highly interconnected sample data across all modules
-- =====================================================

-- 1. ACADEMIC YEAR
INSERT INTO public.academic_years (id, name, start_date, end_date, is_current)
VALUES 
    ('a1111111-1111-4111-a111-111111111111', 'Academic Year 2023-24', '2023-04-01', '2024-03-31', false),
    ('a2222222-2222-4222-a222-222222222222', 'Academic Year 2024-25', '2024-04-01', '2025-03-31', true)
ON CONFLICT DO NOTHING;

-- 2. SUBJECTS
INSERT INTO public.subjects (id, name, code, description)
VALUES 
    ('s1111111-1111-4111-s111-111111111111', 'Mathematics', 'MATH101', 'Core mathematics and logic'),
    ('s2222222-2222-4222-s222-222222222222', 'Science', 'SCI102', 'General science and laboratory experiments'),
    ('s3333333-3333-4333-s333-333333333333', 'English literature', 'ENG103', 'Grammar, literature and creative writing'),
    ('s4444444-4444-4444-s444-444444444444', 'History', 'HIST104', 'World history and geography'),
    ('s5555555-5555-4555-s555-555555555555', 'Computer Science', 'CS105', 'Programming and digital literacy')
ON CONFLICT (code) DO NOTHING;

-- 3. CLASSES & SECTIONS
INSERT INTO public.classes (id, name, capacity, room_number, academic_year_id)
VALUES 
    ('c1111111-1111-4111-c111-111111111111', 'Grade 10', 40, 'R-101', 'a2222222-2222-4222-a222-222222222222'),
    ('c2222222-2222-4222-c222-222222222222', 'Grade 11', 35, 'R-201', 'a2222222-2222-4222-a222-222222222222'),
    ('c3333333-3333-4333-c333-333333333333', 'Grade 12', 30, 'R-301', 'a2222222-2222-4222-a222-222222222222')
ON CONFLICT DO NOTHING;

-- 4. PROFILES (Teachers & Students)
-- We use static UUIDs for easy referencing in next steps
INSERT INTO public.profiles (id, full_name, role, email)
VALUES 
    ('f1111111-1111-4111-f111-111111111111', 'Dr. Aris V.', 'teacher', 'aris@edufox.com'),
    ('f2222222-2222-4222-f222-222222222222', 'Prof. Sarah Jenkins', 'teacher', 'sarah@edufox.com'),
    ('f3333333-3333-4333-f333-333333333333', 'Marcus Thorne', 'teacher', 'marcus@edufox.com'),
    ('p1111111-1111-4111-p111-111111111111', 'Ethan Hunt', 'student', 'ethan@student.com'),
    ('p2222222-2222-4222-p222-222222222222', 'Selina Kyle', 'student', 'selina@student.com'),
    ('p3333333-3333-4333-p333-333333333333', 'Bruce Wayne', 'student', 'bruce@student.com'),
    ('p4444444-4444-4444-p444-444444444444', 'Diana Prince', 'student', 'diana@student.com'),
    ('p5555555-5555-4555-p555-555555555555', 'Clark Kent', 'student', 'clark@student.com')
ON CONFLICT (id) DO NOTHING;

-- 5. TEACHERS TABLE
INSERT INTO public.teachers (id, employee_id, specialization, qualification, joining_date)
VALUES 
    ('f1111111-1111-4111-f111-111111111111', 'EMP-001', ARRAY['Mathematics', 'Physics'], 'PhD in Mathematics', '2020-01-15'),
    ('f2222222-2222-4222-f222-222222222222', 'EMP-002', ARRAY['English', 'History'], 'MA in English', '2021-06-20'),
    ('f3333333-3333-4333-f333-333333333333', 'EMP-003', ARRAY['Computer Science'], 'M.Tech CSE', '2022-03-10')
ON CONFLICT (employee_id) DO NOTHING;

-- 6. STUDENTS TABLE
INSERT INTO public.students (id, admission_number, roll_number, class_id, date_of_birth, gender)
VALUES 
    ('p1111111-1111-4111-p111-111111111111', 'ADM-1001', '1001', 'c1111111-1111-4111-c111-111111111111', '2008-05-12', 'Male'),
    ('p2222222-2222-4222-p222-222222222222', 'ADM-1002', '1002', 'c1111111-1111-4111-c111-111111111111', '2008-09-21', 'Female'),
    ('p3333333-3333-4333-p333-333333333333', 'ADM-1003', '1003', 'c1111111-1111-4111-c111-111111111111', '2007-12-01', 'Male'),
    ('p4444444-4444-4444-p444-444444444444', 'ADM-1004', '1004', 'c2222222-2222-4222-c222-222222222222', '2006-03-15', 'Female'),
    ('p5555555-5555-4555-p555-555555555555', 'ADM-1005', '1005', 'c2222222-2222-4222-c222-222222222222', '2006-11-28', 'Male')
ON CONFLICT (admission_number) DO NOTHING;

-- 7. ATTENDANCE (Recent 5 days for Grade 10)
INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
SELECT 
    p.id as student_id,
    'c1111111-1111-4111-c111-111111111111' as class_id,
    dt::date,
    CASE WHEN random() > 0.1 THEN 'present' ELSE 'absent' END as status,
    'f1111111-1111-4111-f111-111111111111' as marked_by
FROM 
    (SELECT id FROM public.students WHERE class_id = 'c1111111-1111-4111-c111-111111111111') p,
    generate_series(CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE, '1 day') dt
ON CONFLICT (student_id, date) DO NOTHING;

-- 8. EXAMS & MARKS
INSERT INTO public.exams (id, name, academic_year_id, start_date, end_date)
VALUES 
    ('e1111111-1111-4111-e111-111111111111', 'Mid-Term Examination', 'a2222222-2222-4222-a222-222222222222', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade)
SELECT 
    'e1111111-1111-4111-e111-111111111111',
    p.id,
    s.id,
    round((random() * 40 + 60)::numeric, 2),
    100,
    'A'
FROM 
    public.students p,
    public.subjects s
ON CONFLICT (exam_id, student_id, subject_id) DO NOTHING;

-- 9. FEES & PAYMENTS
INSERT INTO public.fees (id, name, amount, due_date, class_id, fee_type)
VALUES 
    ('fe111111-1111-4111-fe11-111111111111', 'Term 1 Tuition Fee', 25000, CURRENT_DATE + INTERVAL '10 days', 'c1111111-1111-4111-c111-111111111111', 'tuition'),
    ('fe222222-2222-4222-fe22-222222222222', 'Annual Sports Fee', 5000, CURRENT_DATE - INTERVAL '10 days', 'c1111111-1111-4111-c111-111111111111', 'sports')
ON CONFLICT DO NOTHING;

INSERT INTO public.payments (student_id, fee_id, amount_paid, status, payment_method, receipt_number)
SELECT 
    id,
    'fe222222-2222-4222-fe22-222222222222',
    5000,
    'completed',
    'online',
    'RCP-' || floor(random() * 89999 + 10000)::text
FROM public.students
WHERE class_id = 'c1111111-1111-4111-c111-111111111111'
ON CONFLICT DO NOTHING;

-- 10. LIBRARY
INSERT INTO public.library_books (title, author, category, total_copies, available_copies, shelf_location)
VALUES 
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 5, 3, 'A-101'),
    ('A Brief History of Time', 'Stephen Hawking', 'Science', 3, 2, 'S-201'),
    ('Clean Code', 'Robert C. Martin', 'Computer Science', 4, 4, 'T-301'),
    ('To Kill a Mockingbird', 'Harper Lee', 'Classic', 6, 5, 'L-401')
ON CONFLICT DO NOTHING;

-- 11. INVENTORY
INSERT INTO public.inventory_items (name, category, quantity_in_stock, unit_price, sku, min_stock_level)
VALUES 
    ('Whiteboard Markers (Blue)', 'Stationery', 12, 45, 'ST-MB01', 20),
    ('A4 Paper Rim', 'Stationery', 45, 350, 'ST-PR01', 10),
    ('Basketballs', 'Sports', 8, 1200, 'SP-BB01', 5),
    ('Microscope Slides', 'Lab Equipment', 150, 10, 'LB-MS01', 50)
ON CONFLICT (sku) DO NOTHING;

-- 12. STAFF HR (Leaves & Payroll)
INSERT INTO public.leave_requests (staff_id, leave_type, start_date, end_date, reason, status)
VALUES 
    ('f1111111-1111-4111-f111-111111111111', 'sick', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE, 'Severe viral fever', 'approved'),
    ('f2222222-2222-4222-f222-222222222222', 'casual', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '6 days', 'Family function', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO public.staff_payrolls (staff_id, base_salary, bonuses, deductions, month, year, status)
VALUES 
    ('f1111111-1111-4111-f111-111111111111', 75000, 5000, 2000, EXTRACT(MONTH FROM CURRENT_DATE)::int, EXTRACT(YEAR FROM CURRENT_DATE)::int, 'pending'),
    ('f2222222-2222-4222-f222-222222222222', 68000, 0, 1500, EXTRACT(MONTH FROM CURRENT_DATE)::int, EXTRACT(YEAR FROM CURRENT_DATE)::int, 'paid')
ON CONFLICT (staff_id, month, year) DO NOTHING;

-- 13. TRANSPORT
INSERT INTO public.bus_routes (name, route_number, driver_name, driver_phone, plate_number)
VALUES 
    ('Route Alpha - North City', 'RT-001', 'John Doe', '+91 9876543210', 'MH-12-AB-1234'),
    ('Route Beta - West Suburbs', 'RT-002', 'Mike Smith', '+91 9876543211', 'MH-12-CD-5678')
ON CONFLICT (route_number) DO NOTHING;

INSERT INTO public.bus_stops (route_id, name, pickup_time, drop_time, stop_order)
VALUES 
    ((SELECT id FROM public.bus_routes WHERE route_number = 'RT-001'), 'Main Gate', '07:30', '16:30', 1),
    ((SELECT id FROM public.bus_routes WHERE route_number = 'RT-001'), 'City Square', '07:50', '16:10', 2)
ON CONFLICT DO NOTHING;

-- 14. MESSAGES & NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, body, type)
VALUES 
    ('f1111111-1111-4111-f111-111111111111', 'Leave Approved', 'Your sick leave for Oct 12-14 has been approved.', 'success'),
    ('f2222222-2222-4222-f222-222222222222', 'Payroll Disbursed', 'Your salary for the month has been credited.', 'info')
ON CONFLICT DO NOTHING;
