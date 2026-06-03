const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();

  console.log('--- ALL ROWS IN user_roles ---');
  const res = await client.query(`
    SELECT * FROM public.user_roles;
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
