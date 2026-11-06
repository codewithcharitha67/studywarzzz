// Register + Login
//   POST /api/register  → creates a NEW account (username must be unused)
//   POST /api/login     → only works for accounts that are already registered
// Passwords are stored as salted scrypt hashes in Supabase (never as plain text).
const crypto = require('crypto');
const router = require('express').Router();
const db = require('../database/db');
const { wrap } = require('./errorHandler');
const { tokenFor, validUsername, validPassword } = require('./helpers');

function readCreds(req, res) {
  const u = String(req.body.username || '').trim(), p = String(req.body.password || '');
  if (!validUsername(u) || !validPassword(p)) { res.status(400).json({ error: 'Invalid username or password format' }); return null; }
  return { u, p };
}

router.post('/register', wrap(async (req, res) => {
  const c = readCreds(req, res); if (!c) return;
  if (await db.getUser(c.u)) return res.status(409).json({ error: 'This username is already registered. Please login, or choose another username.' });
  const salt = crypto.randomBytes(16).toString('hex');
  try { await db.addUser(c.u, salt, crypto.scryptSync(c.p, salt, 64).toString('hex')); }
  catch (e) { if (e.code === '23505') return res.status(409).json({ error: 'This username is already registered. Please login, or choose another username.' }); throw e; }
  res.json({ ok: true, created: true, username: c.u, token: tokenFor(c.u) });
}));

router.post('/login', wrap(async (req, res) => {
  const c = readCreds(req, res); if (!c) return;
  const user = await db.getUser(c.u);
  if (!user) return res.status(404).json({ error: 'No account found for this username. Please register first.' });
  const given = crypto.scryptSync(c.p, user.salt, 64), saved = Buffer.from(user.hash, 'hex');
  if (given.length !== saved.length || !crypto.timingSafeEqual(given, saved)) return res.status(401).json({ error: 'Wrong password' });
  res.json({ ok: true, username: user.username, token: tokenFor(user.username) });
}));

module.exports = router;
