import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  const { data: profiles, error } = await supabase.from("profiles").select("email, role, first_name");
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log(JSON.stringify(profiles, null, 2));
  }
}

checkUsers();
