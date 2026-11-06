// Battle scores + live leaderboard (login required)
const router = require('express').Router();
const db = require('../database/db');
const auth = require('./middleware-auth');
const { wrap } = require('./errorHandler');
const { clean } = require('./helpers');

router.post('/scores', auth, wrap(async (req, res) => {
  const score = Math.max(0, Math.min(100000, parseInt(req.body.score, 10) || 0));
  await db.addScore({ username: req.user, avatar: clean(req.body.avatar, 8) || '⚡', score, subject: clean(req.body.subject, 20) });
  res.json({ ok: true });
}));

router.get('/leaderboard', auth, wrap(async (req, res) => {
  const best = new Map();                       // best score per player
  (await db.topScores(200)).forEach((r) => { if (!best.has(r.username)) best.set(r.username, r); });
  res.json([...best.values()].slice(0, 10).map(({ username, avatar, score }) => ({ username, avatar, score })));
}));

module.exports = router;
