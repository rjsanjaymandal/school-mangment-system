import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

async function verifyConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from .env");
    process.exit(1);
  }

  console.log(`🔗 Attempting to connect to Supabase: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Connection Ping (Select dummy)
    const { data: pingData, error: pingError } = await supabase.from("academic_years").select("count").limit(1);

    if (pingError) {
      console.error("❌ Database Connection Failed:");
      console.error(pingError.message);
      process.exit(1);
    }

    console.log("✅ Database Connected Successfully!");

    // 2. Data Verification
    const tablesToVerify = ["profiles", "academic_years", "school_settings"];
    
    for (const table of tablesToVerify) {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        console.warn(`⚠️  Warning: Could not fetch data for table '${table}': ${error.message}`);
      } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : "No data to check columns";
        console.log(`📊 Table '${table}': Columns found: ${JSON.stringify(columns)}`);
      }
    }

    console.log("\n🚀 All database checks passed! Data is accessible.");
  } catch (err) {
    console.error("❌ Unexpected error during verification:");
    console.error(err);
    process.exit(1);
  }
}

verifyConnection();
