const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT pg_get_functiondef(oid) 
      FROM pg_proc 
      WHERE proname = 'rpc_generate_optimized_schedule'
    `);
    const def = res.rows[0]?.pg_get_functiondef;
    console.log('RPC Start:', def.substring(0, 2000));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
