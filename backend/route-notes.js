// Notes: upload / list / open / delete (files in Supabase Storage, details in Postgres)
const router = require('express').Router();
const multer = require('multer');
const db = require('../database/db');
const auth = require('./middleware-auth');
const { wrap } = require('./errorHandler');
const { clean } = require('./helpers');

const isId = (v) => /^[0-9a-f-]{36}$/i.test(v);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/notes', auth, wrap(async (req, res) => {
  res.json(await db.listNotes(req.user));
}));

router.post('/notes', auth, upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const subject = clean(req.body.subject, 20) || 'c';
  const kb = req.file.size / 1024;
  const size = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
  const id = await db.addNote({ subject, title: req.file.originalname, mime: req.file.mimetype, size, owner: req.user }, req.file.buffer);
  res.json({ id });
}));

router.get('/notes/:id/file', auth, wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).end();
  const n = await db.getNote(req.params.id, req.user);
  if (!n) return res.status(404).end();
  const buf = await db.readNoteFile(n);
  res.type(n.mime || 'application/octet-stream').send(buf);
}));

router.delete('/notes/:id', auth, wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).end();
  await db.deleteNote(req.params.id, req.user);
  res.json({ ok: true });
}));

module.exports = router;
