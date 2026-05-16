const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres:njgeagyQ2tIfVpF9@db.syppmhoshwxzhjpqzvaz.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT * FROM timetables LIMIT 5;
    `);
    console.log('Timetable Rows:', res.rows);
    const slotsRes = await client.query(`
      SELECT * FROM timetable_slots LIMIT 5;
    `);
    console.log('Slot Rows:', slotsRes.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
