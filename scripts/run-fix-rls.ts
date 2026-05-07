import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function runFix() {
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
    console.log("Connected!");

    const sqlPath = path.join(process.cwd(), "migrations", "fix_all_rls.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Applying fix_all_rls.sql...");
    await client.query(sql);
    console.log("Applied successfully!");

  } catch (err) {
    console.error("Execution Failure:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runFix();
