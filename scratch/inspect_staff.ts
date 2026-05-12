import { Client } from "pg";

async function inspectStaff() {
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
    console.log("Connected to Supabase Postgres.");

    // Inspect staff table columns
    console.log("\n--- Staff Table Columns ---");
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'staff'
      ORDER BY ordinal_position;
    `);
    columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error("Inspection Failed:", err);
  } finally {
    await client.end();
  }
}

inspectStaff();
