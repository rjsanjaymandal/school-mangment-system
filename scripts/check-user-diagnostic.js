/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function checkUser() {
  const client = new Client({
    user: "postgres",
    password: "Ev?9ZLqUfi@PJM&",
    host: "db.syppmhoshwxzhjpqzvaz.supabase.co",
    port: 5432,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rows } = await client.query("SELECT * FROM public.profiles WHERE id::text LIKE '6386ba1d%'");
    console.log("User Profile Found:", JSON.stringify(rows, null, 2));

    const { rows: allUsers } = await client.query("SELECT id, full_name, email, role FROM public.profiles LIMIT 10");
    console.log("Recent Profiles:", JSON.stringify(allUsers, null, 2));

  } catch (err) {
    console.error("Diagnostic Failure:", err);
  } finally {
    await client.end();
  }
}

checkUser();
