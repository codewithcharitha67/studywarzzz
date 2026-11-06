// Wraps async route handlers so any error becomes a clean JSON 500 response
const { explain } = require('../database/db');

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error('❌', e && e.message ? e.message : e);
  res.status(500).json({ error: explain(e) });
});

module.exports = { wrap };
