import { useEffect, useState } from 'react';

const apiBase = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [health, setHealth] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setError('');
      setLoading(true);

      const [healthRes, notesRes] = await Promise.all([
        fetch(`${apiBase}/health`),
        fetch(`${apiBase}/notes`)
      ]);

      const healthData = await healthRes.json();
      const notesData = await notesRes.json();

      setHealth(healthData);
      setNotes(notesData);
    } catch (err) {
      setError('Failed to load data from backend');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${apiBase}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setTitle('');
      await loadData();
    } catch (err) {
      setError('Failed to create note');
    }
  }

  return (
    <div className="page">
      <main className="card">
        <p className="badge">DigitalOcean Full-Stack Lab</p>
        <h1>Frontend + Backend + PostgreSQL + Nginx</h1>
        <p className="subtitle">
          This app is served through Nginx on port 80 and routes <code>/</code> to the frontend and <code>/api</code> to the backend.
        </p>

        <div className="status">
          <div>
            <span className="label">Backend</span>
            <div className="value">{loading ? 'Loading...' : health?.status || 'Unknown'}</div>
          </div>
          <div>
            <span className="label">Database</span>
            <div className="value">{loading ? 'Loading...' : health?.database || 'Unknown'}</div>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Add a new note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {error && <p className="error">{error}</p>}

        <section className="list">
          <h2>Saved notes</h2>
          {notes.length === 0 ? (
            <p>No notes yet.</p>
          ) : (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.title}</strong>
                  <span>{new Date(note.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
