// Checks the login token sent by the frontend (x-sw-user + x-sw-token headers)
const crypto = require('crypto');
const { tokenFor } = require('./helpers');

module.exports = function auth(req, res, next) {
  const u = String(req.headers['x-sw-user'] || ''), t = String(req.headers['x-sw-token'] || '');
  if (!u || t.length !== 64 || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(tokenFor(u)))) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  req.user = u;
  next();
};
