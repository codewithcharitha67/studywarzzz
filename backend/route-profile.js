// GET/PUT /api/profile — XP, coins, character, to-dos, syllabus ticks (needs login)
const router = require('express').Router();
const db = require('../database/db');
const auth = require('./middleware-auth');
const { wrap } = require('./errorHandler');

router.get('/profile', auth, wrap(async (req, res) => {
  res.json({ data: await db.getProfile(req.user) });
}));

router.put('/profile', auth, wrap(async (req, res) => {
  const d = req.body && req.body.data;
  if (!d || typeof d !== 'object' || JSON.stringify(d).length > 200000) return res.status(400).json({ error: 'Bad data' });
  await db.setProfile(req.user, d);
  res.json({ ok: true });
}));

module.exports = router;
