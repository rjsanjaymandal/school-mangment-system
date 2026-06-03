const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();

  const res = await client.query(`
    SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
    FROM 
        information_schema.table_constraints tc
    WHERE 
        tc.constraint_name = '2200_25895_2_not_null';
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
