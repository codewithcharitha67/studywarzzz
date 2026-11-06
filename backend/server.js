// StudyWarz backend — Node.js + Express + Supabase
// Serves the frontend (../frontend) AND the API (/api/...) from ONE port, so the browser never has a
// "server not connected" problem as long as you open the address printed in the terminal.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('../database/db');

const FRONTEND = path.join(__dirname, '..', 'frontend');
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());                                   // lets Live Server / other origins call the API too
app.use(express.json({ limit: '1mb' }));

// ---- API ----
app.get('/api/health', async (req, res) => {
  const r = await db.checkConnection().catch((e) => ({ ok: false, message: e.message }));
  res.status(r.ok ? 200 : 500).json({ ok: r.ok, supabase: r.ok ? 'connected' : r.message });
});
app.use('/api', require('./route-auth'));
app.use('/api', require('./route-profile'));
app.use('/api', require('./route-rooms'));
app.use('/api', require('./route-scores'));
app.use('/api', require('./route-notes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route: ' + req.path }));

// ---- Frontend (only the frontend folder is public — never backend/, database/ or .env) ----
app.use(express.static(FRONTEND));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// last-resort error handler (bad JSON, upload too big, ...)
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  res.status(err.status || 500).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50 MB)' : err.message || 'Server error' });
});

const server = app.listen(PORT, async () => {
  console.log(`\nStudyWarz running → http://localhost:${PORT}   (open THIS address in your browser)`);
  const r = await db.checkConnection().catch((e) => ({ ok: false, message: e.message }));
  if (r.ok) console.log('✅ Supabase connected (tables + storage ready)');
  else console.error('❌ Supabase problem: ' + r.message);
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`\n❌ Port ${PORT} is already in use. Close the other terminal running the server, or set PORT=3001 in .env.\n`);
  else console.error('❌', e.message);
  process.exit(1);
});
