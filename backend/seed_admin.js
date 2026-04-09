const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const check = await pool.query("SELECT * FROM admin WHERE email = 'admin@company.com'");
    if (check.rows.length === 0) {
      console.log('Inserting default admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await pool.query(
        "INSERT INTO admin (name, email, password) VALUES ($1, $2, $3)",
        ['Admin User', 'admin@company.com', hashedPassword]
      );
      console.log('Default admin admin@company.com / admin123 inserted.');
    } else {
      console.log('Admin already exists.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}

run();
