import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const table = process.argv[2];
  const action = process.argv[3] || "select";
  const body = process.argv[4] ? JSON.parse(process.argv[4]) : null;

  if (action === "select") {
    const { data, error } = await supabase.from(table).select("*");
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
  } else if (action === "upsert") {
    const { data, error } = await supabase.from(table).upsert(body);
    if (error) console.error(error);
    else console.log("Upsert successful");
  }
}

run();
