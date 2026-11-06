// StudyWarz database layer — 100% Supabase (Postgres tables + Storage bucket "notes").
// Every function is async. The backend routes only talk to this file.
const { createClient } = require('@supabase/supabase-js');

// clean the .env values (removes quotes / spaces / trailing slash / "/rest/v1" people sometimes paste)
const strip = (v) => String(v || '').trim().replace(/^["']+|["']+$/g, '').trim();
const SUPABASE_URL = strip(process.env.SUPABASE_URL).replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const SUPABASE_SERVICE_KEY = strip(process.env.SUPABASE_SERVICE_KEY);
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || /YOUR-PROJECT|YOUR_SERVICE/i.test(SUPABASE_URL + SUPABASE_SERVICE_KEY)) {
  console.error('\n❌ Supabase keys missing. Copy .env.example to .env (in the main studywarzzz folder) and paste your Project URL + service_role key.\n');
  process.exit(1);
}
const jwtRole = (k) => { try { return JSON.parse(Buffer.from(k.split('.')[1], 'base64url').toString()).role; } catch (e) { return null; } };
if (jwtRole(SUPABASE_SERVICE_KEY) === 'anon') {
  console.error('\n❌ You pasted the "anon" key. Use the "service_role" (secret) key from Supabase → Project Settings → API.\n');
  process.exit(1);
}
process.env.SUPABASE_SERVICE_KEY = SUPABASE_SERVICE_KEY;   // so the login token secret uses the cleaned key
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const BUCKET = 'notes';
const fail = (error) => { if (error) { const e = new Error(explain(error)); e.code = error.code; throw e; } };

// turn Supabase errors into messages a human can act on
function explain(err) {
  const m = String((err && err.message) || err || ''), c = String((err && err.code) || '');
  if (c === '42P01' || c === 'PGRST205' || /schema cache|does not exist|relation .* not found/i.test(m)) return 'Supabase tables not found — open Supabase → SQL Editor, paste database/schema.sql and press Run.';
  if (/invalid api key|jwt|apikey/i.test(m)) return 'Supabase rejected the key — use the service_role (secret) key in .env.';
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(m)) return 'Cannot reach Supabase — check SUPABASE_URL in .env and your internet.';
  if (c === '23505') return 'Already exists.';
  return m || 'Database error';
}

module.exports = {
  explain,
  // startup self-check: tables exist, key works, storage bucket exists (created automatically if missing)
  async checkConnection() {
    const t = await sb.from('users').select('username').limit(1);
    if (t.error) return { ok: false, message: explain(t.error) };
    const b = await sb.storage.getBucket(BUCKET);
    if (b.error) {
      const c = await sb.storage.createBucket(BUCKET, { public: false });
      if (c.error) return { ok: false, message: 'Storage bucket "notes" could not be created: ' + explain(c.error) };
    }
    return { ok: true };
  },
  // ---- users ----
  async getUser(username) {                       // case-insensitive: Ben@2026 and ben@2026 are the same account
    const { data, error } = await sb.from('users').select('username,salt,hash').ilike('username', username).limit(1);
    fail(error); return (data && data[0]) || null;
  },
  async addUser(username, salt, hash) {
    fail((await sb.from('users').insert({ username, salt, hash })).error);
  },

  // ---- profiles (XP, coins, character, to-dos, syllabus ticks) ----
  async getProfile(username) {
    const { data, error } = await sb.from('profiles').select('data').eq('username', username).maybeSingle();
    fail(error); return data ? data.data : null;
  },
  async setProfile(username, data) {
    fail((await sb.from('profiles').upsert({ username, data, updated_at: new Date().toISOString() })).error);
  },

  // ---- rooms (battle PIN codes) ----
  async getRoom(code) {
    const { data, error } = await sb.from('rooms').select('*').eq('code', code).maybeSingle();
    fail(error); return data;
  },
  async addRoom(code, subject, host) {            // false if the code already exists
    const { error } = await sb.from('rooms').insert({ code, subject, host });
    return !error;
  },
  async getPlayers(code) {
    const { data, error } = await sb.from('room_players').select('username,avatar').eq('code', code);
    fail(error); return data || [];
  },
  async upsertPlayer(code, username, avatar) {
    fail((await sb.from('room_players').upsert({ code, username, avatar }, { onConflict: 'code,username' })).error);
  },

  // ---- scores ----
  async addScore({ username, avatar, score, subject }) {
    fail((await sb.from('scores').insert({ username, avatar, score, subject })).error);
  },
  async topScores(limit = 200) {
    const { data, error } = await sb.from('scores').select('username,avatar,score').order('score', { ascending: false }).limit(limit);
    fail(error); return data || [];
  },

  // ---- notes (file in Storage + details in Postgres) ----
  async listNotes(owner) {
    const { data, error } = await sb.from('notes').select('id,subject,title,mime,size').eq('owner', owner).order('created_at', { ascending: false });
    fail(error); return data || [];
  },
  async addNote({ subject, title, mime, size, owner }, buffer) {
    const safe = title.replace(/[^\w.\-]+/g, '_');
    const path = `${owner}/${subject}/${Date.now()}_${safe}`;
    fail((await sb.storage.from(BUCKET).upload(path, buffer, { contentType: mime, upsert: false })).error);
    const { data, error } = await sb.from('notes').insert({ subject, title, mime, size, path, owner }).select('id').single();
    fail(error); return data.id;
  },
  async getNote(id, owner) {                      // only returns the note if it belongs to this user
    const { data, error } = await sb.from('notes').select('id,path,mime,title').eq('id', id).eq('owner', owner).maybeSingle();
    fail(error); return data;
  },
  async readNoteFile(note) {                       // note = row from getNote()
    const { data, error } = await sb.storage.from(BUCKET).download(note.path);
    fail(error); return Buffer.from(await data.arrayBuffer());
  },
  async deleteNote(id, owner) {
    const n = await this.getNote(id, owner);
    if (!n) return;
    await sb.storage.from(BUCKET).remove([n.path]);
    fail((await sb.from('notes').delete().eq('id', id)).error);
  },
};
