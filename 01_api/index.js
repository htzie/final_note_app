const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'final_notesdb',
  port: Number(process.env.DB_PORT || 3307),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// JWT middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'missing token' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || "secret123", (err, decoded) => {
    if (err) return res.status(401).json({ error: 'invalid token' });
    req.user = decoded;
    next();
  });
}

// Health check
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: 'db_error', error: e.message });
  }
});

/* ==========================
    AUTH ROUTES
========================== */

// REGISTER (user)
app.post('/auth/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "missing fields" });

  const hash = await bcrypt.hash(password, 10);

  try {
    const [rows] = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, hash, role]
    );

    res.status(201).json({ id: rows.insertId, username, role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LOGIN
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0) return res.status(400).json({ error: "user not found" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) return res.status(400).json({ error: "wrong password" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "2d" }
  );

  res.json({ token });
});

/* ==========================
    NOTES ROUTES
========================== */

// GET ALL NOTES
app.get('/notes', auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, title, content, color, created_at FROM notes WHERE owner_id = ? ORDER BY id DESC",
    [req.user.id]
  );
  res.json(rows);
});

// CREATE NOTE (supports color)
app.post('/notes', auth, async (req, res) => {
  const { title, content, color } = req.body;

  if (!title) return res.status(400).json({ error: "title required" });

  const noteColor = color || "#ffffff";

  const [result] = await pool.query(
    "INSERT INTO notes (title, content, color, owner_id) VALUES (?, ?, ?, ?)",
    [title, content, noteColor, req.user.id]
  );

  res.status(201).json({
    id: result.insertId,
    title,
    content,
    color: noteColor
  });
});

// UPDATE NOTE
app.put('/notes/:id', auth, async (req, res) => {
  const { title, content, color } = req.body;

  const noteColor = color || "#ffffff";

  await pool.query(
    "UPDATE notes SET title = ?, content = ?, color = ? WHERE id = ? AND owner_id = ?",
    [title, content, noteColor, req.params.id, req.user.id]
  );

  res.json({ updated: true });
});

// DELETE NOTE
app.delete('/notes/:id', auth, async (req, res) => {
  await pool.query(
    "DELETE FROM notes WHERE id = ? AND owner_id = ?",
    [req.params.id, req.user.id]
  );
  res.json({ deleted: true });
});

// Start server
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API running at http://localhost:${port}`));