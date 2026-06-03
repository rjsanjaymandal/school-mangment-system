const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();

  console.log('\n--- user_roles COLUMNS ---');
  const resColumns = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_roles';
  `);
  console.table(resColumns.rows);

  await client.end();
}

main().catch(console.error);
