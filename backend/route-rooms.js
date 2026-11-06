// Battle rooms: host makes a code (SW-1234), friends join with it
const router = require('express').Router();
const db = require('../database/db');
const auth = require('./middleware-auth');
const { wrap } = require('./errorHandler');
const { clean } = require('./helpers');

router.post('/rooms', auth, wrap(async (req, res) => {
  const subject = clean(req.body.subject, 20) || 'c', host = req.user;
  for (let i = 0; i < 8; i++) {
    const code = 'SW-' + Math.floor(1000 + Math.random() * 9000);
    if (await db.addRoom(code, subject, host)) {
      await db.upsertPlayer(code, host, clean(req.body.avatar, 8) || '⚡');
      return res.json({ code, subject, host });
    }
  }
  res.status(500).json({ error: 'Could not create room' });
}));

router.get('/rooms/:code', auth, wrap(async (req, res) => {
  const code = clean(req.params.code, 12).toUpperCase();
  const room = await db.getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ ...room, players: await db.getPlayers(code) });
}));

router.post('/rooms/:code/join', auth, wrap(async (req, res) => {
  const code = clean(req.params.code, 12).toUpperCase();
  if (!(await db.getRoom(code))) return res.status(404).json({ error: 'Room not found' });
  await db.upsertPlayer(code, req.user, clean(req.body.avatar, 8) || '⚡');
  res.json({ ok: true });
}));

module.exports = router;
