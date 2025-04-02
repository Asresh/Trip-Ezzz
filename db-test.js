import pg from 'pg';
const { Pool } = pg;

console.log('Testing connection to Postgres...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Not defined');

try {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('Pool created, attempting to connect...');

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error executing query:', err);
    } else {
      console.log('Database query successful:', res.rows[0]);
    }
    
    pool.end();
  });
} catch (error) {
  console.error('Error creating pool:', error);
}