import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 5000);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false
});

async function waitForDatabase(retries = 20, delayMs = 2000) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      lastError = error;
      console.log(`Database not ready yet (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const result = await pool.query('SELECT COUNT(*)::int AS count FROM notes');
  if (result.rows[0].count === 0) {
    await pool.query(
      'INSERT INTO notes (title) VALUES ($1), ($2), ($3)',
      ['Project is ready', 'Docker Compose is running', 'PostgreSQL data is persistent']
    );
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    const db = await pool.query('SELECT NOW() AS now');
    res.json({
      status: 'ok',
      database: 'connected',
      time: db.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

app.get('/api/notes', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, created_at FROM notes ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO notes (title) VALUES ($1) RETURNING id, title, created_at',
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note' });
  }
});

app.get('/', (_req, res) => {
  res.send('Backend is running. Use /api/health or /api/notes');
});

async function start() {
  await waitForDatabase();
  await initDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
