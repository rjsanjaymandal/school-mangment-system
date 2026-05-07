-- =====================================================
-- UPDATE DUMMY DATA FOR STUDENTS AND STAFF
-- Populating missing fields for a more realistic demo
-- =====================================================

DO $$
BEGIN
    -- 1. Update Staff (Teachers)
    -- Dr. Aris V.
    UPDATE public.staff 
    SET "father's_name" = 'Victor Aris',
        mobile = '+91 98765 11111',
        email = 'aris@edufox.com',
        address = '123 Academic Block, City Campus',
        city = 'San Francisco',
        state = 'California',
        pincode = '94101',
        date_of_joining = '2020-01-15',
        monthly_salary = 75000.00,
        aadhar_number = '1234 5678 9012',
        pan_number = 'ABCDE1234F',
        gender = 'male',
        date_of_birth = '1985-05-20'
    WHERE id = 'f1111111-1111-4111-f111-111111111111';

    -- Prof. Sarah Jenkins
    UPDATE public.staff 
    SET "father's_name" = 'Robert Jenkins',
        mobile = '+91 98765 22222',
        email = 'sarah@edufox.com',
        address = '456 Literature Lane, West Side',
        city = 'London',
        state = 'Greater London',
        pincode = 'SW1A 1AA',
        date_of_joining = '2021-06-20',
        monthly_salary = 68000.00,
        aadhar_number = '2345 6789 0123',
        pan_number = 'BCDEF2345G',
        gender = 'female',
        date_of_birth = '1988-11-12'
    WHERE id = 'f2222222-2222-4222-f222-222222222222';

    -- Marcus Thorne
    UPDATE public.staff 
    SET "father's_name" = 'Silas Thorne',
        mobile = '+91 98765 33333',
        email = 'marcus@edufox.com',
        address = '789 Tech Hub, Silicon Valley',
        city = 'San Jose',
        state = 'California',
        pincode = '95101',
        date_of_joining = '2022-03-10',
        monthly_salary = 85000.00,
        aadhar_number = '3456 7890 1234',
        pan_number = 'CDEFG3456H',
        gender = 'male',
        date_of_birth = '1992-02-28'
    WHERE id = 'f3333333-3333-4333-f333-333333333333';

    -- 2. Update Students
    -- Ethan Hunt
    UPDATE public.students
    SET category = 'General',
        religion = 'Christian',
        mother_tongue = 'English',
        rte_status = false,
        admission_date = '2023-04-05'
    WHERE id = 'd1111111-1111-4111-d111-111111111111';

    -- Selina Kyle
    UPDATE public.students
    SET category = 'OBC',
        religion = 'Other',
        mother_tongue = 'English',
        rte_status = true,
        admission_date = '2023-04-10'
    WHERE id = 'd2222222-2222-4222-d222-222222222222';

    -- Bruce Wayne
    UPDATE public.students
    SET category = 'General',
        religion = 'Christian',
        mother_tongue = 'English',
        rte_status = false,
        admission_date = '2023-04-01'
    WHERE id = 'd3333333-3333-4333-d333-333333333333';

    -- Diana Prince
    UPDATE public.students
    SET category = 'General',
        religion = 'Other',
        mother_tongue = 'Greek',
        rte_status = false,
        admission_date = '2023-04-15'
    WHERE id = 'd4444444-4444-4444-d444-444444444444';

    -- Clark Kent
    UPDATE public.students
    SET category = 'EWS',
        religion = 'Christian',
        mother_tongue = 'English',
        rte_status = false,
        admission_date = '2023-04-20'
    WHERE id = 'd5555555-5555-4555-d555-555555555555';

END $$;
