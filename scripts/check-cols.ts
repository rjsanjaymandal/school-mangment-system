import { Client } from "pg";

async function checkCols() {
  const client = new Client({
    user: "postgres",
    password: "njgeagyQ2tIfVpF9",
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
        WHERE table_name = 'staff'
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
