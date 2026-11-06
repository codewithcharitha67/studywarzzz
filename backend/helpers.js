// Small helpers shared by the backend
const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_KEY;

// remove < > and cut long text (keeps user input safe)
const clean = (v, n = 40) => String(v || '').replace(/[<>]/g, '').trim().slice(0, n);

// login token = HMAC of the username
const tokenFor = (u) => crypto.createHmac('sha256', SECRET).update(String(u)).digest('hex');

// validation rules: username 7+ letters/numbers/@, password 5+ letters/numbers
const validUsername = (u) => /^[A-Za-z0-9@]{7,30}$/.test(u);
const validPassword = (p) => /^[A-Za-z0-9]{5,40}$/.test(p);

module.exports = { clean, tokenFor, validUsername, validPassword };
