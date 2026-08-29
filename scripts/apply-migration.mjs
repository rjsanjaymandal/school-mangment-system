import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres database successfully.");

    const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20260604000001_reconcile_core_schema_and_rpcs.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Applying migration 20260604000001_reconcile_core_schema_and_rpcs.sql...");
    await client.query(sql);

    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
