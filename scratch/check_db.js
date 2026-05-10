import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: students, error: studentError } = await supabase.from('students').select('count');
  console.log("Student count result:", { students, studentError });

  const { data: profiles, error: profileError } = await supabase.from('profiles').select('count');
  console.log("Profile count result:", { profiles, profileError });
  
  const { data: teachers, error: teacherError } = await supabase.from('teachers').select('count');
  console.log("Teacher count result:", { teachers, teacherError });

  const { data: classes, error: classError } = await supabase.from('classes').select('count');
  console.log("Class count result:", { classes, classError });
}

checkData().catch(console.error);