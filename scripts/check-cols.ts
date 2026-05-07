import { Client } from "pg";

async function checkCols() {
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
    const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'staff_attendance'
        AND table_schema = 'public';
    `);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkCols();
