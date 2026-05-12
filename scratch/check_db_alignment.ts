import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlignment() {
  const tables = [
    'profiles', 'students', 'staff', 'user_roles', 'classes', 
    'attendance', 'exams', 'fees', 'notifications', 'library_books',
    'exam_questions', 'current_cash_balance'
  ];

  console.log('--- Database Alignment Check ---');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`⚠️ Table ${table}:`, JSON.stringify(error));
    } else {
      console.log(`✅ Table ${table}: EXISTS & REACHABLE`);
    }
  }
}

checkAlignment();
