
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log("Testing Supabase connection...");
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Fetching current academic year...");
    const { data: ay, error: ayError } = await supabase
        .from("academic_years")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();

    if (ayError) console.error("AY Error:", ayError);
    else console.log("AY:", ay);

    console.log("Fetching students...");
    const { data: students, error: sError } = await supabase
        .from("students")
        .select("id")
        .limit(5);

    if (sError) console.error("Students Error:", sError);
    else console.log("Students count:", students.length);
}

test();
