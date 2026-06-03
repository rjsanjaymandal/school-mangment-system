const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres'
});

async function main() {
  await client.connect();

  console.log('--- ALL TRIGGERS ---');
  const res = await client.query(`
    SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
  `);
  
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
