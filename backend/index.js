const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'benmega500@gmail.com',
    pass: 'yuvbbzmubmgvhczd'
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });
  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user;
    next();
  });
};

// ─────────────────────────── AUTHENTICATION ───────────────────────────

app.post('/api/auth/register-send-otp', async (req, res) => {
  try {
    const { email, password, name, department } = req.body;

    const userExist = await pool.query('SELECT email FROM employees WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await pool.query(
      'INSERT INTO email_otps (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    const mailOptions = {
      from: 'benmega500@gmail.com',
      to: email,
      subject: 'Registration Verification OTP',
      text: `Your OTP for confirming your registration is: ${otp}. It will expire in 15 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Mail Error:', error);
      }
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = jwt.sign(
      { email, name, department, password_hash: hashedPassword },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '15m' }
    );

    res.json({ token, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { token, otp } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const { email, name, department, password_hash } = decoded;

    const result = await pool.query(
      'SELECT id FROM email_otps WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const lastEmp = await pool.query("SELECT employee_id FROM employees WHERE employee_id LIKE 'EMP%' ORDER BY employee_id DESC LIMIT 1");
    let newId = 'EMP001';
    if (lastEmp.rows.length > 0) {
      const last = parseInt(lastEmp.rows[0].employee_id.replace("EMP", ""), 10);
      newId = `EMP${String(last + 1).padStart(3, "0")}`;
    }

    const newEmp = await pool.query(
      'INSERT INTO employees (employee_id, name, email, department, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, employee_id, name, email',
      [newId, name, email, department, password_hash]
    );

    await pool.query('DELETE FROM email_otps WHERE email = $1', [email]); // cleanup

    const createdUser = newEmp.rows[0];
    const userRole = 'employee';

    res.status(201).json({ ...createdUser, role: userRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed or token expired" });
  }
});

app.post('/api/auth/employee-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const userRole = 'employee';

    const token = jwt.sign(
      { id: user.id, employee_id: user.employee_id, role: userRole, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, employee_id: user.employee_id, name: user.name, email: user.email, role: userRole, department: user.department }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const userRole = 'admin';

    const token = jwt.sign(
      { id: user.id, role: userRole, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: userRole }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const userExist = await pool.query('SELECT email FROM employees WHERE email = $1', [email]);
    if (userExist.rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await pool.query(
      'INSERT INTO email_otps (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    const mailOptions = {
      from: 'benmega500@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 15 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Mail Error:', error);
      }
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '15m' });
    res.json({ token, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { token, code } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const email = decoded.email;

    const result = await pool.query(
      'SELECT id FROM email_otps WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const newJwt = jwt.sign({ email, otp: code }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '15m' });
    res.json({ token: newJwt, valid: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Verification failed or token expired" });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const email = decoded.email;
    const otp = decoded.otp;

    const result = await pool.query(
      'SELECT id FROM email_otps WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, otp]
    );

    if (result.rows.length === 0) {
       return res.status(400).json({ error: "Invalid session" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query('UPDATE employees SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
    await pool.query('DELETE FROM email_otps WHERE email = $1', [email]); // cleanup

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Reset failed or token expired" });
  }
});

// Get current user info from token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const result = await pool.query(
        'SELECT id, name, email FROM admin WHERE id = $1',
        [req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Admin not found" });
      const user = result.rows[0];
      return res.json({ ...user, role: 'admin' });
    }

    const result = await pool.query(
      'SELECT id, employee_id, name, email, department, face_descriptor, "APPROVED" as approved FROM employees WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    const hasFace = Array.isArray(user.face_descriptor) && user.face_descriptor.length > 0;

    res.json({ ...user, role: 'employee', face_registered: hasFace, approved: user.approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────── EMPLOYEES ───────────────────────────

// List all employees
app.get('/api/employees', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM employees');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT id, employee_id, name, email, department, face_descriptor IS NOT NULL AND array_length(face_descriptor, 1) > 0 as face_registered, "APPROVED" as approved FROM employees ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({ data: result.rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add employee (admin)
app.post('/api/employees', async (req, res) => {
  try {
    const { employee_id, name, department } = req.body;

    const result = await pool.query(
      'INSERT INTO employees (employee_id, name, department) VALUES ($1, $2, $3) RETURNING id, employee_id, name, department',
      [employee_id, name, department]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, department } = req.body;
    await pool.query('UPDATE employees SET name = $1, department = $2 WHERE id = $3', [name, department, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve employee
app.put('/api/employees/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access Denied" });
    const { approved } = req.body;
    
    if (approved) {
      const emp = await pool.query('SELECT face_descriptor FROM employees WHERE id = $1', [req.params.id]);
      if (!emp.rows[0].face_descriptor || emp.rows[0].face_descriptor.length === 0) {
        return res.status(400).json({ error: "Cannot approve: Employee has not registered their face yet." });
      }
    }
    
    await pool.query('UPDATE employees SET "APPROVED" = $1 WHERE id = $2', [approved, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register face descriptor
app.post('/api/employees/:id/face', async (req, res) => {
  try {
    const { descriptor } = req.body;
    await pool.query('UPDATE employees SET face_descriptor = $1 WHERE id = $2', [descriptor, req.params.id]);
    res.json({ success: true, message: "Face descriptor registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register face descriptor by employee_id (text)
app.post('/api/employees/face-by-empid/:employee_id', async (req, res) => {
  try {
    const { descriptor } = req.body;
    const result = await pool.query('UPDATE employees SET face_descriptor = $1 WHERE employee_id = $2 RETURNING employee_id', [descriptor, req.params.employee_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });
    res.json({ success: true, message: "Face descriptor registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify face (get stored descriptor by email)
app.get('/api/employees/verify', async (req, res) => {
  try {
    const { email } = req.query;
    const result = await pool.query('SELECT id, employee_id, face_descriptor FROM employees WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────── ATTENDANCE ───────────────────────────

// Punch in
app.post('/api/attendance/punch-in', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, remark } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const duplicateCheck = await pool.query('SELECT id FROM attendance WHERE employee_id = $1 AND date = $2', [userId, date]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: "Attendance already marked for today" });
    }

    const { rows } = await pool.query(
      'INSERT INTO attendance (employee_id, date, punch_in, status, remark) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [userId, date, status || 'Present', remark || 'On Time']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Punch out
app.post('/api/attendance/punch-out', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date().toISOString().split('T')[0];

    const record = await pool.query('SELECT id, punch_out FROM attendance WHERE employee_id = $1 AND date = $2', [userId, date]);

    if (record.rows.length === 0) {
      return res.status(400).json({ error: "No punch-in found for today" });
    }

    if (record.rows[0].punch_out) {
      return res.status(400).json({ error: "Already punched out today" });
    }

    const { rows } = await pool.query(
      'UPDATE attendance SET punch_out = NOW() WHERE id = $1 RETURNING *',
      [record.rows[0].id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's record for current user
app.get('/api/attendance/my-today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT id, punch_in, punch_out, remark FROM attendance WHERE employee_id = $1 AND date = $2',
      [userId, date]
    );

    res.json(result.rows.length > 0 ? result.rows[0] : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user's attendance history
app.get('/api/attendance/my-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, date, status, punch_in, remark FROM attendance WHERE employee_id = $1 ORDER BY date DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's attendance (admin)
app.get('/api/attendance/today', async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const result = await pool.query(`
      SELECT a.id, a.employee_id as db_fk_id, a.punch_in, a.remark, e.name, e.department, e.employee_id
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date = $1
      ORDER BY a.punch_in DESC
    `, [date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all attendance records (admin)
app.get('/api/attendance/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.date, a.status, a.punch_in, a.employee_id as db_fk_id, e.employee_id, e.name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by date (admin)
app.get('/api/attendance/by-date', async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(`
      SELECT a.employee_id as db_fk_id, a.punch_in, a.punch_out, e.employee_id, e.name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date = $1
      ORDER BY e.employee_id
    `, [date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by date range (monthly report)
app.get('/api/attendance/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    const result = await pool.query(`
      SELECT a.employee_id as db_fk_id, a.date, e.employee_id
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date >= $1 AND a.date <= $2
    `, [start, end]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get absent employees for a specific date
app.get('/api/attendance/absent', async (req, res) => {
  try {
    const { date } = req.query;

    // Get all employees
    const allEmps = await pool.query('SELECT id, employee_id, name FROM employees');

    // Get present employee ids for the date
    const presentResult = await pool.query('SELECT employee_id FROM attendance WHERE date = $1', [date]);
    const presentIds = new Set(presentResult.rows.map(r => r.employee_id));

    // Filter absent
    const absent = allEmps.rows.filter(emp => !presentIds.has(emp.id));

    res.json(absent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ message: 'Smart Attendance Backend API is running' });
});

app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
