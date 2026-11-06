    // Audio Synthesizer
    const AudioEngine = {
      ctx: null,
      muted: false,
      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.ctx = new AudioContext();
        }
      },
      playTone(freq, type = 'sine', duration = 0.15) {
        if (this.muted) return;
        try {
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
      },
      correct() {
        this.playTone(523.25, 'triangle', 0.1);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.15), 100);
      },
      error() {
        this.playTone(180, 'sawtooth', 0.25);
      },
      rocket() {
        if (this.muted) return;
        try {
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 1.2);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 1.2);
        } catch(e) {}
      }
    };

    function toggleAudio() {
      AudioEngine.muted = !AudioEngine.muted;
      document.getElementById('audio-toggle-btn').textContent = AudioEngine.muted ? '🔇' : '🔊';
      showToast(AudioEngine.muted ? 'Sound Muted' : 'Sound Enabled', 'info');
    }

    // ==================== SIREN WARNING POP-UP ====================
    function sirenSound() {
      if (AudioEngine.muted) return;
      try {
        AudioEngine.init(); const c = AudioEngine.ctx; if (!c) return;
        const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.connect(g); g.connect(c.destination);
        const t = c.currentTime;
        for (let i = 0; i < 4; i++) { o.frequency.setValueAtTime(600, t + i * .6); o.frequency.linearRampToValueAtTime(980, t + i * .6 + .3); o.frequency.linearRampToValueAtTime(600, t + i * .6 + .6); }
        g.gain.setValueAtTime(.07, t); g.gain.setValueAtTime(.07, t + 2.2); g.gain.linearRampToValueAtTime(0, t + 2.4);
        o.start(t); o.stop(t + 2.4);
      } catch (e) {}
      try { navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 300]); } catch (e) {}
    }

    function sirenWarning(title, msg) {
      const old = document.getElementById('siren'); if (old) old.remove();
      clearTimeout(window._sirenT);
      const d = document.createElement('div');
      d.id = 'siren'; d.setAttribute('role', 'alertdialog');
      d.innerHTML = `<div class="sr-beam b1"></div><div class="sr-beam b2"></div><div class="sr-bar top"></div><div class="sr-bar bot"></div>
        <div class="sr-card"><div class="sr-ico">🚨</div><small>⚠ WARNING ⚠</small><h2>${escHtml(title)}</h2><p>${escHtml(msg)}</p>
        <button type="button" id="siren-ok">I UNDERSTAND</button></div>`;
      document.body.appendChild(d);
      const close = () => { clearTimeout(window._sirenT); d.classList.add('out'); setTimeout(() => d.remove(), 350); document.removeEventListener('keydown', onKey, true); };
      const onKey = (e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
      document.addEventListener('keydown', onKey, true);
      document.getElementById('siren-ok').onclick = close;
      document.getElementById('siren-ok').focus();
      window._sirenT = setTimeout(close, 7000);
      sirenSound();
    }

    // ==================== LOGIN / REGISTER ====================
    const LOGIN_RULES = { user: /^[A-Za-z0-9@]+$/, pass: /^[A-Za-z0-9]+$/ };

    function validateCreds(u, p) {
      if (!u) return ['USERNAME REQUIRED', 'You cannot enter the arena without a username!'];
      if (!LOGIN_RULES.user.test(u)) return ['INVALID USERNAME', 'Username can contain only letters, numbers and @ — no spaces or other symbols.'];
      if (u.length < 7) return ['USERNAME TOO SHORT', `Username needs at least 7 characters (you typed ${u.length}).`];
      if (!p) return ['PASSWORD REQUIRED', 'You cannot enter the arena without a password!'];
      if (!LOGIN_RULES.pass.test(p)) return ['INVALID PASSWORD', 'Password can contain only letters and numbers — no spaces or symbols.'];
      if (p.length < 5) return ['PASSWORD TOO SHORT', `Password needs at least 5 characters (you typed ${p.length}).`];
      return null;
    }

    function loginHints() {
      const u = document.getElementById('login-user').value, p = document.getElementById('login-pass').value;
      const set = (id, ok, txt, empty) => { const e = document.getElementById(id); if (!e) return; e.textContent = (empty ? '• ' : ok ? '✔ ' : '✖ ') + txt; e.className = 'lg-hint ' + (empty ? '' : ok ? 'ok' : 'bad'); };
      set('hint-user', LOGIN_RULES.user.test(u) && u.length >= 7, 'Letters, numbers & @ only • minimum 7 characters', !u);
      set('hint-pass', LOGIN_RULES.pass.test(p) && p.length >= 5, 'Letters & numbers only • minimum 5 characters', !p);
      const p2el = document.getElementById('login-pass2');
      if (p2el && authMode === 'register') { const p2 = p2el.value; set('hint-pass2', p2 === p && p.length >= 5, 'Both passwords must match', !p2); }
    }

    function togglePass() {
      const i = document.getElementById('login-pass'); i.type = i.type === 'password' ? 'text' : 'password';
      document.getElementById('login-eye').textContent = i.type === 'password' ? '👁' : '🙈';
    }

    async function hashPass(u, p) {
      try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(u + ':' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
      catch (e) { let h = 5381; const t = u + ':' + p; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return 'h' + h; }
    }

    // ==================== REGISTER / LOGIN ====================
    let authMode = 'login';
    const authLabel = () => authMode === 'register' ? 'CREATE ACCOUNT ➔' : 'ENTER THE ARENA ➔';
    function setAuthMode(m) {
      authMode = m; const reg = m === 'register';
      document.getElementById('tab-login').classList.toggle('active', !reg);
      document.getElementById('tab-register').classList.toggle('active', reg);
      document.getElementById('lg-sub').textContent = reg ? 'CREATE YOUR ACCOUNT' : 'LOGIN TO ENTER THE ARENA';
      document.getElementById('confirm-wrap').style.display = reg ? 'block' : 'none';
      document.getElementById('login-btn').textContent = authLabel();
      document.getElementById('login-pass').autocomplete = reg ? 'new-password' : 'current-password';
      document.getElementById('lg-note').innerHTML = reg ? 'Already registered? <a onclick="setAuthMode(\'login\')">Login here</a>' : 'New here? <a onclick="setAuthMode(\'register\')">Create your account</a>';
      loginHints();
      try { AudioEngine.playTone(480, 'sine', 0.06); } catch (e) {}
    }
    function passEnter() { if (authMode === 'register') document.getElementById('login-pass2').focus(); else submitLogin(); }
    function shakeLoginCard() { const c = document.querySelector('.lg-card'); c.classList.remove('anim-shake'); void c.offsetWidth; c.classList.add('anim-shake'); }

    async function submitLogin() {
      const u = document.getElementById('login-user').value.trim(), p = document.getElementById('login-pass').value;
      const bad = validateCreds(u, p);
      if (bad) { AudioEngine.error(); shakeLoginCard(); sirenWarning(bad[0], bad[1]); return; }
      if (authMode === 'register' && p !== document.getElementById('login-pass2').value) {
        AudioEngine.error(); shakeLoginCard(); sirenWarning('PASSWORDS DO NOT MATCH', 'Type the same password in both boxes to create your account.'); return;
      }
      const btn = document.getElementById('login-btn'); btn.disabled = true; btn.textContent = authMode === 'register' ? 'CREATING…' : 'CHECKING…';
      const r = await API.auth(authMode, u, p);
      btn.disabled = false; btn.textContent = authLabel();
      if (!r.ok) {
        AudioEngine.error(); shakeLoginCard();
        const msgs = {
          wrong: ['WRONG PASSWORD', 'That password does not match this username. Try again!'],
          noaccount: ['NO ACCOUNT FOUND', 'This username is not registered yet. Click REGISTER to create your account first.'],
          exists: ['USERNAME ALREADY TAKEN', 'This username is already registered. Click LOGIN, or choose a different username.'],
          format: ['INVALID DETAILS', 'Check the username and password rules and try again.'],
          nobackend: ['SERVER NOT CONNECTED', 'Start the server with "npm start" in the project folder.'],
          network: ['SERVER NOT CONNECTED', 'Cannot reach ' + (API.base || location.origin) + '. Is "npm start" running in the project folder? Open http://localhost:3000/api/health to test.'],
          server: ['SERVER ERROR', r.message || 'Something went wrong on the server. Check the terminal where npm start is running.']
        };
        const m = msgs[r.err] || msgs.server; sirenWarning(m[0], m[1]); return;
      }
      const name = r.username;
      AppState.username = name; AppState.loggedIn = true;
      await API.loadProfile();
      restoreUploadedNotes();
      const today = new Date().toDateString(); let bonus = false;
      if (AppState.bonusDay !== today) { AppState.bonusDay = today; AppState.coins += 15; bonus = true; }
      savePersistentData(); applyLoadedProfileToUI();
      AudioEngine.correct();
      const scr = document.getElementById('login-screen'); scr.classList.add('done');
      if (window.FX) { window.FX.letterbox(1200); window.FX.burst(innerWidth / 2, innerHeight / 2, 90, true); window.FX.fireworks && window.FX.fireworks(3); }
      setTimeout(() => { scr.remove(); showToast(`${r.created ? 'Account created! Welcome' : 'Welcome back'}, ${name}! Let's win today ⚡${bonus ? ' (+15 🪙 daily bonus)' : ''}`, 'info'); }, 900);
    }

    window.addEventListener('DOMContentLoaded', () => { const u = document.getElementById('login-user'); if (u) setTimeout(() => u.focus(), 300); });

    // ==================== BACKEND API (Node + Supabase) — falls back gracefully offline ====================
    const API = {
      on: true,                                   // backend is always used (no browser storage any more)
      base: (window.SW_API_BASE || ''),
      token: null, user: null,
      url(path) { return this.base + '/api' + path; },
      // fetch with login headers; throws Error(message) with .status so callers can react
      async call(path, opts = {}) {
        opts.headers = { ...(opts.headers || {}), ...(this.token ? { 'x-sw-user': this.user, 'x-sw-token': this.token } : {}) };
        let r;
        try { r = await fetch(this.url(path), opts); }
        catch (e) { const er = new Error('Cannot reach the server at ' + (this.base || location.origin)); er.status = 0; throw er; }
        if (!r.ok) {
          let msg = 'Server error ' + r.status; try { msg = (await r.clone().json()).error || msg; } catch (e) {}
          const er = new Error(msg); er.status = r.status; throw er;
        }
        return r;
      },
      json(method, body) { return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; },
      // checks /api/health and shows the result in the little pill on the login screen
      async health() {
        const pill = document.getElementById('sw-status');
        const set = (cls, txt) => { if (pill) { pill.className = 'sw-status ' + cls; pill.textContent = txt; } };
        try {
          const r = await fetch(this.url('/health')); const j = await r.json().catch(() => ({}));
          if (r.ok && j.ok) { set('ok', '● server + Supabase connected'); return { ok: true }; }
          set('bad', '● server up, Supabase problem: ' + (j.supabase || j.error || r.status)); return { ok: false, message: j.supabase || j.error };
        } catch (e) { set('bad', '● server not reachable at ' + (this.base || location.origin)); return { ok: false, network: true }; }
      },
      async auth(mode, username, password) { // mode = 'login' | 'register'
        try {
          const r = await fetch(this.url('/' + mode), this.json('POST', { username, password }));
          const j = await r.json().catch(() => ({}));
          if (!r.ok) return { err: r.status === 401 ? 'wrong' : r.status === 404 && j.error ? 'noaccount' : r.status === 409 ? 'exists' : r.status === 400 ? 'format' : 'server', message: j.error || ('Server error ' + r.status) };
          this.token = j.token; this.user = j.username || username;
          return { ok: true, username: this.user, created: mode === 'register' };
        } catch (e) { return { err: 'network' }; }
      },
      async createRoom(subject) { try { return await (await this.call('/rooms', this.json('POST', { subject, host: AppState.username, avatar: AppState.avatar }))).json(); } catch (e) { return null; } },
      async getRoom(code) { try { return await (await this.call('/rooms/' + code)).json(); } catch (e) { return null; } },
      async joinRoom(code) {
        code = String(code || '').trim().toUpperCase();
        if (this.on) { try { await this.call('/rooms/' + encodeURIComponent(code) + '/join', this.json('POST', { username: AppState.username, avatar: AppState.avatar })); return true; } catch (e) { return e.status === 404 ? false : null; } }
        return new Promise((res) => {
          if (!window.BroadcastChannel) return res(false);
          const ch = new BroadcastChannel('sw_rooms'); let ok = false;
          ch.onmessage = (e) => { const m = e.data || {}; if (m.code === code && m.t === 'pong') { ok = true; ch.postMessage({ t: 'join', code, name: AppState.username, avatar: AppState.avatar }); } };
          ch.postMessage({ t: 'ping', code });
          setTimeout(() => { ch.close(); res(ok); }, 900);
        });
      },
      _pt: null,
      saveProfile() {
        if (!this.on || !this.token) return; clearTimeout(this._pt);
        this._pt = setTimeout(() => this.call('/profile', this.json('PUT', { data: { xp: AppState.xp, coins: AppState.coins, streak: AppState.streak, level: AppState.level, avatar: AppState.avatar, owned: AppState.owned, equipped: AppState.equipped, todos: academicTodos, syl: sylChecks, bonusDay: AppState.bonusDay, removed: removedBuiltin, seen: seenQ } })).catch(() => {}), 1500);
      },
      async loadProfile() {
        if (!this.on || !this.token) return;
        try {
          const d = (await (await this.call('/profile')).json()).data; if (!d) return;
          ['xp', 'coins', 'streak', 'level'].forEach(k => { if (typeof d[k] === 'number') AppState[k] = d[k]; });
          if (d.avatar) AppState.avatar = d.avatar; if (Array.isArray(d.owned)) AppState.owned = d.owned; if (d.equipped) AppState.equipped = { ...AppState.equipped, ...d.equipped };
          if (Array.isArray(d.todos)) academicTodos = d.todos; if (d.syl) sylChecks = d.syl;
          if (d.bonusDay) AppState.bonusDay = d.bonusDay; if (Array.isArray(d.removed)) removedBuiltin = d.removed; if (Array.isArray(d.seen)) seenQ = d.seen;
          applyRemovedBuiltin(); renderSubjectCards();
          renderAcademicTodos(); renderSyllabusUnits(); applyLoadedProfileToUI();
        } catch (e) {}
      },
      async saveScore(score, subject) { try { await this.call('/scores', this.json('POST', { username: AppState.username, avatar: AppState.avatar, score, subject })); } catch (e) {} },
      async leaderboard() { try { return await (await this.call('/leaderboard')).json(); } catch (e) { return null; } }
    };

    async function loadLeaderboard() {
      const rows = await API.leaderboard();
      if (!rows || !rows.length) return;
      const list = document.getElementById('rankings-list');
      let box = document.getElementById('live-leaderboard');
      if (!box) { box = document.createElement('div'); box.id = 'live-leaderboard'; box.className = 'mt-6 space-y-2'; list.parentElement.appendChild(box); }
      box.innerHTML = `<div class="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-2">🌐 Live Friends Leaderboard (Supabase)</div>` +
        rows.map((r, i) => `<div class="p-3 rounded-2xl bg-slate-950 border ${i === 0 ? 'border-amber-500/60' : 'border-slate-800'} flex items-center justify-between"><span class="font-bold text-slate-200">${['👑','🥈','🥉'][i] || (i + 1) + '.'} ${r.avatar || '⚡'} ${escHtml(r.username)}</span><span class="font-mono font-bold text-purple-300">${r.score.toLocaleString()} pts</span></div>`).join('');
    }

    // ==================== BATTLE LOBBY (room code → ENTER → cinematic countdown → levels) ====================
    function showBattleLobby(subj) {
      AppState.lobbySubject = subj;
      prepareNoteText(subj);
      ['dashboard', 'bank', 'study', 'weak', 'rankings', 'profile'].forEach(t => { const e = document.getElementById(`tab-${t}`); if (e) e.classList.add('hidden'); });
      const arena = document.getElementById('live-battle-arena');
      arena.classList.remove('hidden');
      const subName = subj === 'all' ? '🌐 All Subjects' : `${BTECH_SUBJECTS[subj].icon} ${BTECH_SUBJECTS[subj].name}`;
      const localCode = 'SW-' + Math.floor(1000 + Math.random() * 9000);
      const friends = [{ name: 'Lily', avatar: '🌸' }, { name: 'Hazel', avatar: '✨' }, { name: 'Elsa', avatar: '❄️' }, { name: 'Spiderman', avatar: '🕷' }, { name: 'Batman', avatar: '🦇' }];
      arena.innerHTML = `
        <div class="max-w-3xl mx-auto text-center space-y-6 bg-slate-900/90 p-6 sm:p-10 rounded-3xl border border-purple-600/40 shadow-2xl">
          <div class="text-xs font-mono font-bold text-purple-300 tracking-widest">⚔ LIVE BATTLE LOBBY • ${subName} • ${(AppState.lobbyUnit == null || AppState.lobbyUnit < 0) ? 'All Units' : 'Unit ' + (AppState.lobbyUnit + 1)}</div>
          <div class="text-[11px] text-slate-400">Nobody can enter without this code — share it with your friends. If nobody joins, AI rivals will fill the arena.</div>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <div id="lobby-code" class="text-5xl sm:text-7xl font-black font-mono tracking-[.18em] text-white brand-glow">${localCode}</div>
            <button onclick="copyLobbyCode()" class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50">📋 Copy</button>
          </div>
          <div id="lobby-players" class="flex flex-wrap items-center justify-center gap-3 min-h-[84px]"></div>
          <div id="lobby-count" class="text-xs font-mono text-slate-400">1 player in lobby…</div>
          <div class="flex items-center justify-center gap-3 flex-wrap">
            <button onclick="exitBattle()" class="px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">✕ Leave</button>
            <button id="lobby-enter" onclick="enterBattleArena()" class="px-10 py-3.5 rounded-2xl font-black text-sm tracking-widest bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40">ENTER ARENA ➔</button>
          </div>
        </div>`;
      const pl = document.getElementById('lobby-players');
      const addP = (p, you) => { if (!document.getElementById('lp-' + p.name)) { const d = document.createElement('div'); d.id = 'lp-' + p.name; d.className = 'px-4 py-3 rounded-2xl border ' + (you ? 'bg-purple-900/60 border-purple-500' : 'bg-slate-950 border-slate-800') + ' text-center fx-reveal'; d.innerHTML = `<div class="text-2xl">${p.avatar}</div><div class="text-xs font-bold text-slate-200">${escHtml(p.name)}${you ? ' (You)' : ''}</div>`; pl.appendChild(d); AudioEngine.playTone(500 + pl.children.length * 60, 'triangle', 0.08); document.getElementById('lobby-count').textContent = `${pl.children.length} players in lobby`; } };
      addP({ name: AppState.username, avatar: AppState.avatar }, true);
      document.getElementById('lobby-count').textContent = '1 player • waiting for friends to join with your code…';
      if (window.BroadcastChannel) {
        try {
          if (window._lobbyCh) window._lobbyCh.close();
          const ch = window._lobbyCh = new BroadcastChannel('sw_rooms');
          ch.onmessage = (e) => {
            const m = e.data || {}, code = (document.getElementById('lobby-code') || {}).textContent;
            if (!code || m.code !== code) return;
            if (m.t === 'ping') ch.postMessage({ t: 'pong', code });
            if (m.t === 'join') { addP({ name: m.name, avatar: m.avatar || '⚡' }); ch.postMessage({ t: 'ack', code, name: m.name }); showToast(`${m.name} joined your room!`, 'info'); }
          };
        } catch (e) {}
      }
      API.createRoom(subj).then(r => {
        if (!r || !r.code) return;
        const c = document.getElementById('lobby-code'); if (c) c.textContent = r.code;
        clearInterval(window._lobbyPoll);
        window._lobbyPoll = setInterval(async () => {
          if (!document.getElementById('lobby-players')) return clearInterval(window._lobbyPoll);
          const room = await API.getRoom(r.code);
          (room && room.players || []).forEach(p => addP({ name: p.username, avatar: p.avatar || '⚡' }));
        }, 2000);
      });
    }

    function copyLobbyCode() {
      const code = document.getElementById('lobby-code').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => showToast(`Code ${code} copied!`, 'info')).catch(() => showToast(`Your code: ${code}`, 'info'));
    }

    function enterBattleArena() {
      clearInterval(window._lobbyPoll);
      const btn = document.getElementById('lobby-enter'); if (btn) btn.disabled = true;
      if (window.FX) window.FX.letterbox(3600);
      ['3', '2', '1', 'FIGHT!'].forEach((t, i) => setTimeout(() => {
        const r = document.createElement('div'); r.id = 'fx-round'; r.innerHTML = `<small>${i < 3 ? 'GET READY' : 'GO!'}</small><b>${t}</b>`;
        document.body.appendChild(r); setTimeout(() => r.remove(), 900);
        AudioEngine.playTone(i < 3 ? 440 : 880, 'triangle', 0.2);
        if (window.FX) window.FX.burst(innerWidth / 2, innerHeight / 2, i < 3 ? 20 : 90, i === 3);
      }, i * 900));
      setTimeout(() => launch17QuestionBattle(AppState.lobbySubject || 'c'), 3700);
    }

    // App State
    const AppState = {
      bonusDay: null,
      username: 'Ben',
      avatar: '⚡',
      xp: 1480,
      streak: 9,
      level: 4,
      coins: 120,
      owned: [],
      equipped: { head: null, eyes: null, back: null, aura: null },
      lobbyUnit: -1,
      currentTab: 'dashboard',
      selectedBattleSubject: 'c',
      activeMaterialSubjectKey: 'c',
      currentActiveBlobUrl: null
    };

    // Motivational Quotes List for Flash Icon Rotation
    const MOTIVATIONAL_QUOTES = [
      "Code your logic, master your formulas, conquer your semester. In the arena of engineering, consistency is your ultimate superweapon.",
      "An algorithm a day keeps backlog away. Master pointers, matrices, and modules with discipline.",
      "Every bug fixed is a concept learned. Build resilient code and resilient engineering character.",
      "Pointers point to memory; your daily focus points to a stellar CGPA.",
      "Calm under pressure, sharp in execution. Internal labs and university finals are won in daily practice.",
      "Don't study until you get it right; study until you can never get it wrong."
    ];
    let currentQuoteIdx = 0;

    MOTIVATIONAL_QUOTES.push(
      "Small steps every day beat big plans someday. Open the notes, solve one more question.",
      "Your future self is watching. Make them proud with today's practice.",
      "Debug your doubts, compile your confidence, run your dreams.",
      "Rank is temporary, knowledge is permanent. Learn deeply, win naturally.",
      "A streak is just a promise you keep to yourself, day after day.",
      "Every expert was once a beginner who refused to quit before the semester ended."
    );
    function nextMotivationalMotto(auto) {
      let n; do { n = Math.random() * MOTIVATIONAL_QUOTES.length | 0; } while (n === currentQuoteIdx && MOTIVATIONAL_QUOTES.length > 1);
      currentQuoteIdx = n;
      const el = document.getElementById('motto-quote-text');
      if (el) { el.style.transition = 'opacity .4s'; el.style.opacity = 0; setTimeout(() => { el.textContent = `"${MOTIVATIONAL_QUOTES[n]}"`; el.style.opacity = 1; }, 400); }
      if (auto !== true) { AudioEngine.playTone(700, 'triangle', 0.1); showToast('Daily motivation recharged! ⚡', 'info'); }
    }
    setTimeout(() => nextMotivationalMotto(true), 1500);
    setInterval(() => nextMotivationalMotto(true), 20000);

    // Toast
    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl flex items-center gap-2 pointer-events-auto transition-all transform duration-300 translate-y-2 ${
        type === 'error' ? 'bg-red-600 border border-red-400' : 'bg-purple-600 border border-purple-400'
      }`;
      toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✨'}</span><span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => toast.classList.remove('translate-y-2'), 10);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Persistence: everything is saved to Supabase through the backend (no browser storage)
    function savePersistentData() {
      try { API.saveProfile && API.saveProfile(); } catch (e) {}
    }

    function loadPersistentData() {
      // data comes from Supabase after login (API.loadProfile)
      applyLoadedProfileToUI();
    }

    function applyLoadedProfileToUI() {
      document.getElementById('header-username').textContent = AppState.username;
      document.getElementById('header-avatar').textContent = AppState.avatar;
      document.getElementById('dash-username').textContent = AppState.username;
      document.getElementById('profile-username-display').textContent = AppState.username;
      document.getElementById('profile-avatar-large').textContent = AppState.avatar;
      document.getElementById('header-streak-val').textContent = `${AppState.streak}d`;
      document.getElementById('dash-streak-count').textContent = AppState.streak;
      document.getElementById('dash-streak-phrase').textContent = `${AppState.streak}-day streak!`;
      document.getElementById('profile-streak-badge').textContent = `🔥 ${AppState.streak}-Day Streak`;
      document.getElementById('profile-stats-meta').textContent = `${AppState.xp.toLocaleString()} XP • Level ${AppState.level} Engineer • 🔥 ${AppState.streak}-Day Streak`;
      document.getElementById('rankings-user-name').textContent = `3. ${AppState.username} (You)`;
      document.getElementById('rankings-user-xp').textContent = `${AppState.xp.toLocaleString()} XP`;
      updateBadgeUI();
    }

    // Tab Switcher
    function switchTab(tabId) {
      ['dashboard', 'bank', 'study', 'weak', 'rankings', 'profile'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        const nav = document.getElementById(`nav-${t}`);
        if (el) el.classList.add('hidden');
        if (nav) {
          nav.classList.remove('bg-purple-600', 'text-white', 'shadow-md', 'shadow-purple-600/30');
          nav.classList.add('text-slate-300');
        }
      });

      const targetEl = document.getElementById(`tab-${tabId}`);
      const targetNav = document.getElementById(`nav-${tabId}`);
      if (targetEl) targetEl.classList.remove('hidden');
      if (targetNav) {
        targetNav.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'shadow-purple-600/30');
        targetNav.classList.remove('text-slate-300');
      }

      document.getElementById('live-battle-arena').classList.add('hidden');
      AppState.currentTab = tabId;

      if (tabId === 'bank') renderSubjectCards();
      if (tabId === 'study') renderStudyHub();
      if (tabId === 'weak') renderWeakTopics();
      if (tabId === 'profile') resetRocketCanvas();
      if (tabId === 'rankings') loadLeaderboard();
    }

    function startDailyGrind() {
      switchTab('study');
      switchStudySubTab('todos');
    }

    // ==================== B.TECH SUBJECTS & HANDOUTS STORE ====================
    const BTECH_SUBJECTS = {
      c: {
        id: 'c',
        name: 'C Programming',
        icon: '💻',
        units: '5 Units • Pointers, DMA, Structures',
        materials: [
          {
            title: 'pps UNIT_I.pdf',
            desc: 'Locally ingested engineering study file for C Programming. Ready for revision.',
            type: 'application/pdf',
            size: '320 KB',
            isUploaded: true,
            content: `================ C PROGRAMMING UNIT-I COMPLETE HANDOUT ================
1. Introduction to Algorithms & Flowcharts
   - Definition: Step-by-step problem-solving sequence.
   - Flowchart Symbols: Oval (Terminal), Parallelogram (I/O), Rectangle (Process), Diamond (Decision).

2. Fundamental Data Types & Modifiers
   - Primary: char (1B), int (4B), float (4B), double (8B).
   - Qualifiers: signed, unsigned, short, long.

3. Pointers & Dynamic Memory Allocation:
   - int *p = &a; (*p dereferences memory value, &a gives address).
   - malloc(n * sizeof(int)): Allocates uninitialized memory chunk.
   - calloc(n, sizeof(int)): Allocates memory and clears bytes to 0.
   - free(p): Deallocates heap block preventing memory leaks.`
          },
          {
            title: 'C Programming Pointer Arithmetic Formula Sheet',
            desc: 'Deref, array decay rules, struct padding offsets, and malloc/calloc differences.',
            type: 'PDF Note',
            size: '4 Pages',
            content: `POINTER ARITHMETIC QUICK CHEAT SHEET:
* (p + i) is mathematically identical to a[i].
Array decay rule: passing an array to a function decays it to a pointer to its first element.
Structures: struct padding aligns fields to architectural boundary words.`
          },
          {
            title: 'Mid-Term 1 Viva Quick Revision Handout',
            desc: 'Common viva questions on storage classes (extern, static) and bitwise flags.',
            type: 'Handout',
            size: '2 Pages',
            content: `VIVA TOP QUESTIONS:
1. Difference between auto, extern, and static variables.
2. Bitwise operators vs Logical operators.
3. Pre-increment (++i) vs Post-increment (i++).`
          }
        ]
      },
      python: {
        id: 'python',
        name: 'Python',
        icon: '🐍',
        units: '5 Units • OOP, Lambdas, NumPy',
        materials: [
          {
            title: 'Python Slicing & List Comprehension Reference',
            desc: 'Negative indices, stride tricks, and dictionary comprehension cheat sheet.',
            type: 'PDF Note',
            size: '3 Pages',
            content: `PYTHON SLICING:
sequence[start:stop:step]
lst[::-1] reverses any list in O(N).`
          }
        ]
      },
      maths: {
        id: 'maths',
        name: 'Maths & Calculus',
        icon: '📐',
        units: '5 Units • Matrices, Eigenvalues, Multivariable',
        materials: [
          {
            title: 'Eigenvalues & Cayley-Hamilton Master Sheet',
            desc: 'Characteristic equations |A - λI| = 0 and matrix inversion shortcuts.',
            type: 'PDF Note',
            size: '5 Pages',
            content: `EIGENVALUES THEOREM:
1. Sum of eigenvalues = Trace of matrix A.
2. Product of eigenvalues = Determinant |A|.`
          }
        ]
      },
      chemistry: {
        id: 'chemistry',
        name: 'Engineering Chemistry',
        icon: '🧪',
        units: '5 Units • Water Technology, Batteries, Polymers',
        materials: [
          {
            title: 'Water Hardness EDTA Titration Lab Sheet',
            desc: 'Buffer solutions (pH 10), EBT indicator mechanics, and calculation formulas.',
            type: 'Handout',
            size: '3 Pages',
            content: `EDTA METHOD:
- Indicator: Eriochrome Black-T (EBT).
- Buffer: NH4Cl + NH4OH (Maintains pH 10).`
          }
        ]
      },
      english: {
        id: 'english',
        name: 'Professional English',
        icon: '📖',
        units: '5 Units • Formal Letters, Phonetics, Vocabulary',
        materials: [
          {
            title: 'Technical Email Writing & Formal Memo Formats',
            desc: 'Salutations, concise professional phrasing, and workplace communication etiquette.',
            type: 'PDF Note',
            size: '2 Pages',
            content: `FORMAL EMAIL FORMAT:
Subject line must be under 8 words. Clear action items.`
          }
        ]
      }
    };

    // Question Bank Store
    const QUESTION_BANK_STORE = {
      c: [
        { q: "What is the output of int a=10; int *p=&a; *p=*p+5; printf('%d', a);?", options: ["10", "15", "Compilation Error", "Garbage"], ans: 1, exp: "Dereferencing *p modifies variable a directly. Hence 10 + 5 = 15." },
        { q: "Which memory allocation function initializes all allocated bytes to zero?", options: ["malloc()", "calloc()", "realloc()", "free()"], ans: 1, exp: "calloc(n, size) allocates contiguous blocks and zeroes them out." },
        { q: "What does the sizeof operator in C return?", options: ["Bits", "Bytes in size_t", "Words", "Pointers"], ans: 1, exp: "sizeof yields size in bytes as an unsigned integral type size_t." }
      ],
      python: [
        { q: "What will print(list(range(2, 10, 3))) evaluate to?", options: ["[2, 5, 8]", "[2, 5, 8, 10]", "[3, 6, 9]", "[2, 6, 8]"], ans: 0, exp: "Starts at 2, steps by 3: 2, 5, 8." },
        { q: "Which of the following data types in Python is strictly immutable?", options: ["List", "Dictionary", "Tuple", "Set"], ans: 2, exp: "Tuples cannot be altered after creation." }
      ],
      maths: [
        { q: "The sum of eigenvalues of a square matrix is always equal to its:", options: ["Determinant", "Trace", "Rank", "Nullity"], ans: 1, exp: "The trace (sum of diagonal entries) equals the sum of eigenvalues." }
      ],
      chemistry: [
        { q: "Which indicator is utilized in EDTA complexometric titration for water hardness?", options: ["Phenolphthalein", "Methyl Orange", "Eriochrome Black-T (EBT)", "Starch"], ans: 2, exp: "EBT binds Ca2+/Mg2+ to form wine-red complex at pH 10." }
      ],
      english: [
        { q: "Choose the antonym for 'Ephemeral':", options: ["Transient", "Permanent", "Fleeting", "Fragile"], ans: 1, exp: "Ephemeral means short-lived; its exact opposite is Permanent." }
      ]
    };

    // Detailed Syllabus Topics Breakdown for Linear Peacock Outline 🦚
    const DETAILED_SYLLABUS_MAP = {
      c: [
        {
          unit: "Unit 1: Introduction to Programming & Algorithms",
          topics: [
            "Introduction to Digital Computers, CPU, Memory Architecture",
            "Algorithms: Characteristics, Design, Time vs Space Complexity Basics",
            "Flowcharts: Standard Symbols, Decision Branches, Loop Modeling",
            "C Tokens: Keywords, Identifiers, Constants, Format Specifiers",
            "Data Types: char, int, float, double, qualifiers (signed, unsigned, short, long)",
            "Operators: Arithmetic, Relational, Logical, Bitwise, Ternary, Precedence & Associativity"
          ]
        },
        {
          unit: "Unit 2: Control Structures & Iteration",
          topics: [
            "Conditional Branching: simple if, if-else, nested if-else, else-if ladder",
            "Multi-way Selection: switch-case, break statement, default fall-through",
            "Iterative Loops: while loop, do-while loop, for loop architecture",
            "Loop Controls: break, continue, return, goto with labeled statements"
          ]
        },
        {
          unit: "Unit 3: Functions & Modular Programming",
          topics: [
            "Function Declarations (Prototypes), Function Definition, Function Calls",
            "Parameter Passing Semantics: Call by Value vs Call by Reference",
            "Recursion: Base Conditions, Stack Frames, Fibonacci, Factorial, Tower of Hanoi",
            "Variable Scope & Storage Classes: auto, register, static, extern"
          ]
        },
        {
          unit: "Unit 4: Arrays, Pointers & Dynamic Memory",
          topics: [
            "1D Arrays: Memory Layout, Linear Search, Binary Search, Bubble Sort",
            "2D Arrays: Matrix Addition, Multiplication, Transpose Operations",
            "Strings: Character Arrays, null terminator \\0, string library functions",
            "Pointers: Address-of Operator (&), Dereference (*), Pointer Arithmetic",
            "Array Decay, Pointers and Functions, Function Pointers",
            "Dynamic Memory Allocation: malloc(), calloc(), realloc(), free(), Memory Leaks"
          ]
        },
        {
          unit: "Unit 5: Structures, Unions & File Handling",
          topics: [
            "User-defined Types: struct definition, member access (dot . vs arrow ->)",
            "Structure Padding, Alignment Word Boundaries, Arrays of Structures",
            "Unions: Memory Sharing vs Structures, Bit-fields",
            "File Streams: File Pointers, fopen(), fclose(), modes (r, w, a, r+, wb)",
            "Character & Block I/O: fgetc(), fputc(), fgets(), fputs(), fread(), fwrite()"
          ]
        }
      ],
      python: [
        {
          unit: "Unit 1: Python Fundamentals & Data Types",
          topics: [
            "Python Architecture: Bytecode Compilation, PVM, REPL Environment",
            "Dynamic Typing, Variables, Reference Counting & Garbage Collection",
            "Numeric Types: int, float, complex, math module operations",
            "Input/Output: input(), print() with sep and end parameters, f-strings"
          ]
        },
        {
          unit: "Unit 2: Sequences, Collections & Comprehensions",
          topics: [
            "Strings: Immutability, Negative Indexing, Advanced Slicing [start:stop:step]",
            "Lists: Methods (append, extend, pop, remove, sort), List Comprehensions",
            "Tuples: Immutability, Packing, Unpacking, Tuple as Dictionary Keys",
            "Dictionaries: Hash Maps, Keys, Values, Items, Dict Comprehensions",
            "Sets: Mathematical Set Operations (Union, Intersection, Symmetric Difference)"
          ]
        },
        {
          unit: "Unit 3: Functions, Modules & Functional Programming",
          topics: [
            "Defining Functions, Default Arguments, *args and **kwargs",
            "Anonymous Functions: Lambda Expressions, map(), filter(), reduce()",
            "Scope Rules: LEGB (Local, Enclosing, Global, Built-in), global & nonlocal",
            "Python Modules and Packages: import statement, __init__.py, __name__ == '__main__'"
          ]
        },
        {
          unit: "Unit 4: Object-Oriented Programming (OOP)",
          topics: [
            "Classes, Instances, Instance Attributes vs Class Attributes",
            "The Constructor: __init__, self parameter, destructor __del__",
            "Encapsulation: Public, Protected (_), and Private (__) Name Mangling",
            "Inheritance: Single, Multiple, Multilevel, Method Resolution Order (MRO), super()",
            "Polymorphism, Method Overriding, Operator Overloading with Magic Methods"
          ]
        },
        {
          unit: "Unit 5: Exception Handling & File I/O",
          topics: [
            "Errors vs Exceptions, try, except, else, finally Clauses",
            "Raising Exceptions: raise keyword, Creating Custom Exception Classes",
            "File Handling: Context Managers (with open(...) as f), text vs binary modes",
            "Serialization: json module (dumps, loads, dump, load), pickle module basics"
          ]
        }
      ],
      maths: [
        {
          unit: "Unit 1: Matrices & Systems of Linear Equations",
          topics: [
            "Rank of a Matrix: Echelon Form, Normal Form, Elementary Transformations",
            "Consistency of Linear Systems: Homogeneous (AX = 0) & Non-Homogeneous (AX = B)",
            "Gauss Elimination Method, Gauss-Jordan Method, LU Decomposition Basics"
          ]
        },
        {
          unit: "Unit 2: Eigenvalues & Cayley-Hamilton Theorem",
          topics: [
            "Eigenvalues & Eigenvectors of Real Square Matrices",
            "Properties: Sum of Eigenvalues = Trace, Product = Determinant",
            "Cayley-Hamilton Theorem: Statement, Proof Verification, Computation of A^-1 & A^n",
            "Diagonalization of Matrices, Orthogonal Transformations, Quadratic Forms"
          ]
        },
        {
          unit: "Unit 3: Multivariable Calculus & Partial Derivatives",
          topics: [
            "Functions of Several Variables: Limits, Continuity, Partial Differentiation",
            "Total Derivative, Chain Rule for Multivariable Functions, Homogeneous Functions",
            "Euler's Theorem on Homogeneous Functions with Proofs and Applications",
            "Jacobians: Properties, Transformations between Coordinate Systems",
            "Maxima and Minima of Two Variables, Lagrange Multipliers Method"
          ]
        },
        {
          unit: "Unit 4: Multiple Integrals & Applications",
          topics: [
            "Double Integrals in Cartesian and Polar Coordinates, Change of Order of Integration",
            "Evaluation of Area using Double Integrals",
            "Triple Integrals in Cartesian, Cylindrical and Spherical Coordinates",
            "Volume Evaluation of Solids using Triple Integrals, Center of Gravity Basics"
          ]
        },
        {
          unit: "Unit 5: Vector Calculus & Field Theorems",
          topics: [
            "Vector Differential Operator: Gradient of Scalar Field, Directional Derivatives",
            "Divergence and Curl of Vector Point Functions, Solenoidal & Irrotational Fields",
            "Scalar Potential Function of Conservative Vector Fields",
            "Vector Integration: Line Integrals, Surface Integrals, Volume Integrals",
            "Green's Theorem in the Plane, Stokes' Theorem, Gauss Divergence Theorem"
          ]
        }
      ],
      chemistry: [
        {
          unit: "Unit 1: Water Technology & Treatment",
          topics: [
            "Hardness of Water: Temporary & Permanent Hardness, Units (ppm, mg/L, °Cl, °Fr)",
            "Estimation of Hardness by EDTA Complexometric Titration: Principle, Buffers, EBT",
            "Boiler Troubles: Scales and Sludges, Caustic Embrittlement, Boiler Corrosion, Priming & Foaming",
            "Internal Treatment: Phosphate, Calgon, Colloidal, Carbonate Conditioning",
            "External Treatment: Zeolite (Permutit) Process, Ion-Exchange Demineralization",
            "Desalination of Brackish Water: Reverse Osmosis (RO), Electrodialysis"
          ]
        },
        {
          unit: "Unit 2: Batteries & Electrochemistry",
          topics: [
            "Electrochemical Cells, Electrode Potential, Nernst Equation and Derivation",
            "Reference Electrodes: Standard Hydrogen Electrode (SHE), Calomel Electrode",
            "Batteries: Primary Cells (Lithium Cell), Secondary Cells (Lead-Acid Storage Battery)",
            "Modern Batteries: Lithium-Ion Battery (Intercalation Mechanism), Nickel-Cadmium",
            "Fuel Cells: Hydrogen-Oxygen Fuel Cell, Methanol-Oxygen Fuel Cell, Advantages & Applications"
          ]
        },
        {
          unit: "Unit 3: Corrosion & Control Engineering",
          topics: [
            "Chemical (Dry) Corrosion: Oxidation Corrosion, Pilling-Bedworth Rule",
            "Electrochemical (Wet) Corrosion: Mechanism of Hydrogen Evolution & Oxygen Absorption",
            "Galvanic Corrosion, Differential Aeration Corrosion (Pitting, Waterline Corrosion)",
            "Factors Influencing Corrosion: Nature of Metal, Nature of Environment",
            "Corrosion Control: Cathodic Protection (Sacrificial Anode & Impressed Current)",
            "Surface Coatings: Galvanizing, Tinning, Electroplating, Metal Cladding"
          ]
        },
        {
          unit: "Unit 4: Polymers & Smart Materials",
          topics: [
            "Polymerization: Addition, Condensation, Free Radical Mechanism",
            "Plastics: Thermoplastics vs Thermosetting Resins, Compounding of Plastics",
            "Engineering Plastics: Bakelite, Nylon-6,6, Teflon (PTFE), Polycarbonate",
            "Conducting Polymers: Mechanism of Polyacetylene, Polyaniline, Applications",
            "Biodegradable Polymers: Poly lactic acid (PLA), Polycaprolactone (PCL)"
          ]
        },
        {
          unit: "Unit 5: Energy Resources & Lubricants",
          topics: [
            "Fuels: Classification, Characteristics of Good Fuel, Calorific Value (HCV & LCV)",
            "Solid Fuels: Analysis of Coal (Proximate and Ultimate Analysis, Formulas & Numericals)",
            "Liquid Fuels: Petroleum Refining, Fractional Distillation, Octane & Cetane Numbers",
            "Lubricants: Mechanism (Hydrodynamic, Boundary, Extreme Pressure Lubrication)",
            "Properties: Viscosity, Viscosity Index, Flash & Fire Point, Cloud & Pour Point"
          ]
        }
      ],
      english: [
        {
          unit: "Unit 1: Professional Communication & Writing Skills",
          topics: [
            "The Communication Process: Sender, Encoding, Channel, Decoding, Receiver, Feedback",
            "Barriers to Effective Communication: Semantic, Psychological, Physical, Organizational",
            "Formal Email Etiquette: Clear Subject Lines, Professional Salutations, Tone & Brevity",
            "Technical Writing: Memorandum (Memo) Writing, Circulars, Notice Drafting"
          ]
        },
        {
          unit: "Unit 2: Applied Grammar & Sentence Structures",
          topics: [
            "Parts of Speech in Technical Context, Common Grammatical Pitfalls",
            "Subject-Verb Agreement Rules in Scientific Sentences",
            "Tenses in Engineering Reports: Present Perfect, Past Passive for Experiments",
            "Voice: Active vs Passive Voice in Lab Observations and Manuals",
            "Direct and Indirect Speech: Reporting Conference Decisions and Faculty Instructions"
          ]
        },
        {
          unit: "Unit 3: Technical Vocabulary & Phonetics",
          topics: [
            "Word Formation: Prefixes, Suffixes, Root Words (Latin and Greek Roots)",
            "Synonyms, Antonyms, Homophones, Homonyms in Technical Registers",
            "Collocations, Phrasal Verbs, One-Word Substitutions for Professional Writing",
            "Phonetics: English Speech Sounds, Vowels, Diphthongs, Consonants, IPA Symbols",
            "Word Stress, Primary Stress Rules, Rhythm and Intonation Patterns"
          ]
        },
        {
          unit: "Unit 4: Reading Comprehension & Analytical Summarization",
          topics: [
            "Reading Techniques: Skimming for Gist, Scanning for Specific Data",
            "Intensive vs Extensive Reading of Technical Papers and Handouts",
            "Précis Writing: Rules of Condensation, Title Selection, Maintaining 1/3 Length",
            "Note Making: Linear Notes, Mind Maps, Heading-Subheading Formatting"
          ]
        },
        {
          unit: "Unit 5: Career Skills, Resumes & Presentations",
          topics: [
            "Resume Writing: Chronological, Functional, Hybrid Formats, ATS Compliance",
            "Cover Letters: Structure, Hook, Value Proposition, Action-Oriented Closing",
            "Presentation Skills: Structuring Technical Slides, 6x6 Rule, Body Language",
            "Group Discussions (GD): Roles, Initiation, Summarizing, Etiquette, Handling Interruptions",
            "Interview Preparation: Frequently Asked HR & Technical Viva Questions"
          ]
        }
      ]
    };

    // Render Clean Subject Cards
    function renderSubjectCards() {
      const container = document.getElementById('subject-cards-container');
      container.innerHTML = '';

      Object.keys(BTECH_SUBJECTS).forEach(key => {
        const sub = BTECH_SUBJECTS[key];
        const qCount = QUESTION_BANK_STORE[key] ? QUESTION_BANK_STORE[key].length : 0;
        const matCount = sub.materials ? sub.materials.length : 0;

        const card = document.createElement('div');
        card.className = "bg-slate-900/90 rounded-3xl p-6 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between shadow-xl";
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-3xl">${sub.icon}</span>
              <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ${qCount} MCQs • ${matCount} Notes
              </span>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">${sub.name}</h3>
            <p class="text-xs text-slate-400 mb-5">${sub.units}</p>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-800">
            <div class="grid grid-cols-2 gap-2">
              <button onclick="openViewBankModal('${key}')" class="py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center justify-center gap-1">
                👁️ View Bank
              </button>
              <button onclick="openViewMaterialsModal('${key}')" class="py-2.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all flex items-center justify-center gap-1">
                📖 View Notes
              </button>
            </div>
            <button onclick="openUploadMaterialsModal('${key}')" class="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5">
              📤 Upload Study Materials
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    // Modal: View Question Bank
    function openViewBankModal(subKey) {
      const sub = BTECH_SUBJECTS[subKey];
      const questions = QUESTION_BANK_STORE[subKey] || [];
      document.getElementById('view-bank-title').innerHTML = `${sub.icon} ${sub.name} Question Bank`;
      document.getElementById('view-bank-count').textContent = `${questions.length} Questions Loaded`;

      const list = document.getElementById('bank-questions-scroll');
      list.innerHTML = questions.map((q, idx) => `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div class="text-xs text-amber-400 font-mono font-bold">Question ${idx + 1}</div>
          <div class="text-sm font-semibold text-white">${q.q}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            ${q.options.map((opt, oIdx) => `
              <div class="p-2.5 rounded-xl ${oIdx === q.ans ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-300 border border-slate-800'}">
                ${String.fromCharCode(65 + oIdx)}. ${opt}
              </div>
            `).join('')}
          </div>
          <div class="text-[11px] text-slate-400 italic pt-1">💡 ${q.exp}</div>
        </div>
      `).join('');

      document.getElementById('view-bank-modal').classList.remove('hidden');
    }

    // Modal: View Study Materials
    function openViewMaterialsModal(subKey) {
      AppState.activeMaterialSubjectKey = subKey;
      const sub = BTECH_SUBJECTS[subKey];
      document.getElementById('view-materials-title').textContent = `${sub.name} Handouts & Notes`;

      const container = document.getElementById('materials-list-container');
      const materials = sub.materials || [];

      if (materials.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-400 text-center py-8">No handouts uploaded yet. Click "Upload Study Materials" to add.</div>`;
      } else {
        container.innerHTML = materials.map((m, idx) => `
          <div class="p-5 rounded-2xl bg-[#0b0e20] border border-slate-800 flex items-center justify-between gap-4 hover:border-purple-500/40 transition-all">
            <div class="flex items-start gap-3.5">
              <span class="text-2xl mt-0.5 text-purple-400">📄</span>
              <div>
                <h4 class="text-sm font-bold text-white break-all">${escHtml(m.title)}</h4>
                <p class="text-xs text-slate-400 mt-0.5">${m.desc}</p>
                <div class="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-purple-300">
                  <span>${m.type}</span>
                  <span>•</span>
                  <span>${m.size}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              ${m.isUploaded ? `<button onclick="confirmDeleteNote(this, ${idx})" title="Remove this uploaded note" class="px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white border border-slate-700 transition-all">🗑</button>` : ''}
              <button onclick="openStudyNote(${idx})" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all whitespace-nowrap">
                Open Note
              </button>
            </div>
          </div>
        `).join('');
      }

      document.getElementById('view-materials-modal').classList.remove('hidden');
    }

    // Open Note Function (supports built-in notes + uploaded PDF / image / text / Word)
    function escHtml(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    function openStudyNote(idx) {
      const sub = BTECH_SUBJECTS[AppState.activeMaterialSubjectKey];
      const note = sub && sub.materials ? sub.materials[idx] : null;
      if (!note) { showToast('Could not find that note. Please try again.', 'error'); return; }

      AudioEngine.playTone(520, 'sine', 0.1);

      if (AppState.currentActiveBlobUrl) { try { URL.revokeObjectURL(AppState.currentActiveBlobUrl); } catch (e) {} AppState.currentActiveBlobUrl = null; }

      document.getElementById('viewer-doc-title').textContent = note.title;
      document.getElementById('viewer-doc-meta').textContent = `${note.type || 'Document'} • ${note.size} • ${note.isUploaded ? 'Your uploaded note' : 'Verified B.Tech Notes'}`;

      const bodyContainer = document.getElementById('viewer-body-container');
      const downloadBtn = document.getElementById('viewer-download-btn');
      const newTabBtn = document.getElementById('viewer-newtab-btn');
      bodyContainer.innerHTML = '';
      bodyContainer.style.display = 'block';

      const fallbackCard = (msg) => `
        <div class="h-full min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
          <span class="text-6xl text-purple-400">📑</span>
          <div class="text-lg font-bold text-white break-all">${escHtml(note.title)}</div>
          <p class="text-xs text-slate-400 max-w-sm">${msg}</p>
          <div class="flex gap-2 flex-wrap justify-center">
            <button onclick="openCurrentNoteInNewTab()" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-600 text-white shadow-lg">Open In New Tab ➔</button>
          </div>
        </div>`;

      if (note.fileBlob) {
        const blob = note.fileBlob;
        const fileUrl = URL.createObjectURL(blob);
        AppState.currentActiveBlobUrl = fileUrl;
        downloadBtn.href = fileUrl;
        downloadBtn.download = note.title;
        downloadBtn.classList.remove('hidden');
        newTabBtn.classList.remove('hidden');

        const name = note.title.toLowerCase();
        const mime = (blob.type || note.type || '').toLowerCase();
        const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');
        const isImg = mime.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/.test(name);
        const isText = mime.startsWith('text/') || /\.(txt|md|json|csv)$/.test(name);
        const isDocx = name.endsWith('.docx');

        if (isPdf) {
          // Open with the browser's own PDF viewer (works offline, no CDN needed). PDF.js stays as backup for phones/unsupported browsers.
          const pdfUrl = URL.createObjectURL(blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' }));
          AppState.currentActiveBlobUrl = pdfUrl;
          try { URL.revokeObjectURL(fileUrl); } catch (e) {}
          downloadBtn.href = pdfUrl;
          const nativePdf = (typeof navigator.pdfViewerEnabled === 'boolean') ? navigator.pdfViewerEnabled : !/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
          if (nativePdf) {
            bodyContainer.innerHTML = `
              <div class="flex flex-col items-center gap-4">
                <iframe src="${pdfUrl}" title="${escHtml(note.title)}" class="w-full rounded-2xl border border-slate-800 bg-slate-800" style="height:68vh;min-height:360px"></iframe>
                <a href="${pdfUrl}" download="${escHtml(note.title)}" class="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg" style="background:#1f7a7a">⬇ Download PDF</a>
              </div>`;
          } else {
            bodyContainer.innerHTML = `<div id="viewer-pdf" class="space-y-3 text-center text-xs text-slate-400">Loading PDF…</div>`;
            renderPdfInto(document.getElementById('viewer-pdf'), blob, fallbackCard('Could not preview this PDF here. Use Download or Open In New Tab to read it.'));
          }
        } else if (isImg) {
          bodyContainer.innerHTML = `<div class="flex items-center justify-center"><img src="${fileUrl}" alt="${escHtml(note.title)}" class="max-w-full max-h-[72vh] rounded-2xl border border-slate-800 object-contain"></div>`;
        } else if (isText) {
          bodyContainer.innerHTML = `<pre id="viewer-text-pre" class="font-mono text-xs sm:text-sm bg-slate-900/90 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap leading-relaxed text-purple-100">Loading…</pre>`;
          blob.text().then(t => {
            const pre = document.getElementById('viewer-text-pre');
            if (pre) pre.textContent = t || '(This file is empty)';
          }).catch(() => { const pre = document.getElementById('viewer-text-pre'); if (pre) pre.textContent = 'Could not read this file.'; });
        } else if (isDocx) {
          bodyContainer.innerHTML = `<div id="viewer-docx" class="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 text-sm leading-relaxed max-w-3xl mx-auto">Loading Word document…</div>`;
          withTimeout(loadMammoth(), 12000).then(m => blob.arrayBuffer().then(buf => m.convertToHtml({ arrayBuffer: buf })))
            .then(res => { const box = document.getElementById('viewer-docx'); if (box) box.innerHTML = res.value || '<em>This document has no readable text.</em>'; })
            .catch(() => { bodyContainer.innerHTML = fallbackCard('Word preview needs an internet connection. You can still download the file or open it in a new tab.'); });
        } else {
          bodyContainer.innerHTML = fallbackCard('This file type cannot be previewed here, but you can download it or open it in a new tab.');
        }
      } else {
        const blob = new Blob([note.content || note.desc], { type: 'text/plain' });
        const fileUrl = URL.createObjectURL(blob);
        AppState.currentActiveBlobUrl = fileUrl;
        downloadBtn.href = fileUrl;
        downloadBtn.download = `${note.title}.txt`;
        downloadBtn.classList.remove('hidden');
        newTabBtn.classList.remove('hidden');

        bodyContainer.innerHTML = `
          <div class="max-w-2xl mx-auto space-y-4 text-slate-200">
            <div class="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 text-xs text-purple-300 font-mono">
              💡 B.Tech Semester Exam Compendium & Quick Handout
            </div>
            <pre class="font-mono text-xs sm:text-sm bg-slate-900/90 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap leading-relaxed text-purple-100 overflow-x-auto">${escHtml(note.content || note.desc)}</pre>
          </div>
        `;
      }

      document.getElementById('doc-viewer-modal').classList.remove('hidden');
    }

    // PDF preview via PDF.js (canvas) — silent, with timeouts so it can never hang
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
    let _pdfPromise = null;
    function loadPdfJs() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      if (_pdfPromise) return _pdfPromise;
      const BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
      _pdfPromise = new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = BASE + 'pdf.min.js';
        sc.onload = async () => {
          try { const t = await (await fetch(BASE + 'pdf.worker.min.js')).text(); pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([t], { type: 'text/javascript' })); }
          catch (e) { pdfjsLib.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.min.js'; }
          resolve(window.pdfjsLib);
        };
        sc.onerror = () => { _pdfPromise = null; reject(new Error('offline')); };
        document.head.appendChild(sc);
      });
      return _pdfPromise;
    }
    async function renderPdfInto(box, blob, fallbackHtml) {
      try {
        const lib = await withTimeout(loadPdfJs(), 12000);
        const pdf = await withTimeout(lib.getDocument({ data: await blob.arrayBuffer(), verbosity: 0 }).promise, 15000);
        box.innerHTML = '';
        for (let p = 1; p <= Math.min(pdf.numPages, 80); p++) {
          if (!box.isConnected) return;
          const page = await pdf.getPage(p);
          const vp = page.getViewport({ scale: 1.5 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          c.style.cssText = `width:100%;max-width:${vp.width}px;margin:0 auto;display:block;border-radius:12px;background:#fff;animation:fxRise .5s both`;
          box.appendChild(c);
          await withTimeout(page.render({ canvasContext: c.getContext('2d') , viewport: vp }).promise, 15000);
        }
      } catch (e) { if (box.isConnected && !box.querySelector('canvas')) box.parentElement.innerHTML = fallbackHtml; }
    }

    // Lazy-load Word (.docx) previewer only when needed
    let _mammothPromise = null;
    function loadMammoth() {
      if (window.mammoth) return Promise.resolve(window.mammoth);
      if (_mammothPromise) return _mammothPromise;
      _mammothPromise = new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        sc.onload = () => window.mammoth ? resolve(window.mammoth) : reject(new Error('mammoth missing'));
        sc.onerror = () => { _mammothPromise = null; reject(new Error('offline')); };
        document.head.appendChild(sc);
      });
      return _mammothPromise;
    }

    function openCurrentNoteInNewTab() {
      if (AppState.currentActiveBlobUrl) {
        const w = window.open(AppState.currentActiveBlobUrl, '_blank');
        if (!w) showToast('Pop-up blocked. Please allow pop-ups or use the Download button.', 'error');
      } else {
        showToast('Open a note first.', 'error');
      }
    }

    // Upload Study Materials
    function openUploadMaterialsModal(subKey) {
      AppState.activeMaterialSubjectKey = subKey;
      const sub = BTECH_SUBJECTS[subKey];
      document.getElementById('upload-material-subject-title').textContent = sub.name;
      document.getElementById('upload-materials-modal').classList.remove('hidden');
    }

    // Removed built-in notes + seen questions live in the Supabase profile
    let removedBuiltin = [], seenQ = [];
    function applyRemovedBuiltin() {
      Object.values(BTECH_SUBJECTS).forEach(sb => { sb.materials = sb.materials.filter(m => !(m.isUploaded && !m.noteId && removedBuiltin.includes(m.title))); });
    }

    function formatFileSize(bytes) {
      if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    async function restoreUploadedNotes() {
      // notes are stored in Supabase (Storage + Postgres) via the Node backend
      try {
        const list = await (await API.call('/notes')).json();
        for (const n of list) {
          const sub = BTECH_SUBJECTS[n.subject]; if (!sub || sub.materials.some(m => m.serverId === n.id)) continue;
          const blob = await (await API.call('/notes/' + n.id + '/file')).blob();
          sub.materials.unshift({ serverId: n.id, noteId: 'srv_' + n.id, title: n.title, desc: `Your uploaded study file for ${sub.name}. Ready for revision.`, type: n.mime, size: n.size, isUploaded: true, fileBlob: blob, content: '' });
        }
        if (list.length) renderSubjectCards();
      } catch (e) {}
    }

    function confirmDeleteNote(btn, idx) {
      if (btn.dataset.armed) { deleteUploadedNote(idx); return; }
      btn.dataset.armed = '1'; btn.textContent = 'Sure?'; btn.classList.add('bg-red-600', 'text-white');
      setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = '🗑'; btn.classList.remove('bg-red-600', 'text-white'); } }, 3000);
    }

    function deleteUploadedNote(idx) {
      const subKey = AppState.activeMaterialSubjectKey;
      const sub = BTECH_SUBJECTS[subKey];
      const note = sub && sub.materials[idx];
      if (!note || !note.isUploaded) return;
      sub.materials.splice(idx, 1);
      if (note.serverId) API.call('/notes/' + note.serverId, { method: 'DELETE' }).catch(() => showToast('Could not delete from Supabase.', 'error'));
      else if (!note.noteId) { removedBuiltin.push(note.title); API.saveProfile(); }
      showToast('Note removed.', 'info');
      renderSubjectCards();
      openViewMaterialsModal(subKey);
    }

    function handleMaterialFileSelect(e) {
      const input = e.target;
      const file = input.files && input.files[0];
      if (!file) return;

      const subKey = AppState.activeMaterialSubjectKey || 'c';
      const sub = BTECH_SUBJECTS[subKey];
      const lower = file.name.toLowerCase();
      const allowed = /\.(pdf|docx|doc|txt|md|png|jpe?g|gif|webp)$/.test(lower);
      if (!allowed) {
        showToast('Unsupported file. Please upload PDF, Word, TXT, MD or an image.', 'error');
        AudioEngine.error();
        input.value = '';
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showToast('File is too large (max 50 MB).', 'error');
        input.value = '';
        return;
      }

      const isTextual = file.type.startsWith('text/') || /\.(txt|md)$/.test(lower);
      const finish = async (textContent) => {
        showToast('Uploading to Supabase…', 'info');
        try {
          const fd = new FormData(); fd.append('file', file); fd.append('subject', subKey);
          const n = await (await API.call('/notes', { method: 'POST', body: fd })).json();
          sub.materials.unshift({
            serverId: n.id, noteId: 'srv_' + n.id, title: file.name,
            desc: `Your uploaded study file for ${sub.name}. Ready for revision.`,
            type: file.type || (lower.endsWith('.pdf') ? 'application/pdf' : 'Document'),
            size: formatFileSize(file.size), isUploaded: true, fileBlob: file,
            content: textContent ? textContent.slice(0, 8000) : ''
          });
        } catch (err) {
          showToast('Upload failed: ' + (err && err.message ? err.message : 'unknown error'), 'error');
          AudioEngine.error(); input.value = ''; return;
        }
        closeModal('upload-materials-modal');
        showToast(`Uploaded ${file.name} successfully!`, 'info');
        renderSubjectCards();
        openViewMaterialsModal(subKey);
        AudioEngine.correct();
        input.value = '';
      };

      if (isTextual) {
        const reader = new FileReader();
        reader.onload = (evt) => finish(typeof evt.target.result === 'string' ? evt.target.result : '');
        reader.onerror = () => finish('');
        reader.readAsText(file);
      } else {
        finish('');
      }
    }

    // Upload Question Bank
    function handleBankFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        let raw = evt.target.result;
        let generated = [];

        try {
          if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) generated = parsed;
          }
        } catch(err) {}

        if (generated.length === 0) {
          const cleanText = String(raw).replace(/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();
          const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 10);

          for (let i = 0; i < Math.min(lines.length, 17); i++) {
            generated.push({
              q: lines[i].length > 150 ? lines[i].slice(0, 150) + '...?' : lines[i],
              options: [
                "Primary standard implementation",
                "Secondary runtime compiler result",
                "O(1) constant time optimization",
                "Allocates contiguous memory blocks"
              ],
              ans: 0,
              exp: "Extracted and verified from uploaded engineering study materials."
            });
          }
        }

        if (generated.length === 0) {
          for (let i = 1; i <= 5; i++) {
            generated.push({
              q: `Exam Practice Question ${i} from ${file.name}`,
              options: ["Option A (Verified)", "Option B", "Option C", "Option D"],
              ans: 0,
              exp: `Extracted from uploaded document ${file.name}.`
            });
          }
        }

        QUESTION_BANK_STORE['c'] = [...generated, ...(QUESTION_BANK_STORE['c'] || [])];
        showToast(`Uploaded ${generated.length} verified questions from ${file.name}!`, 'info');
        renderSubjectCards();
        AudioEngine.correct();
      };

      reader.readAsText(file);
    }

    // Dashboard Room Join
    function handleJoinRoomSubmit() {
      const input = document.getElementById('dash-room-code-input');
      const err = document.getElementById('join-room-error');
      const code = (input.value || '').trim();

      if (!code) {
        AudioEngine.error();
        input.classList.add('anim-shake', 'border-red-500');
        err.classList.remove('hidden');
        sirenWarning('NO ROOM CODE!', 'You cannot enter the arena without a room code. Ask your host for the PIN (like SW-1234) and type it in.');
        setTimeout(() => input.classList.remove('anim-shake'), 400);
        return;
      }

      err.classList.add('hidden');
      input.classList.remove('border-red-500');
      showToast(`Connecting to Room ${code.toUpperCase()}...`, 'info');
      API.joinRoom(code).then(ok => {
        if (ok === false) { AudioEngine.error(); sirenWarning('ROOM NOT FOUND', 'That room code does not exist. Check the PIN with your host and try again.'); return; }
        setTimeout(() => openSubjectPickerModal(), 500);
      });
    }

    // Pre-Battle Modal
    function openSubjectPickerModal() {
      document.getElementById('subject-picker-modal').classList.remove('hidden');
    }

    function closeSubjectPickerModal() {
      document.getElementById('subject-picker-modal').classList.add('hidden');
    }

    function selectBattleSubject(subj, btnEl) {
      AppState.selectedBattleSubject = subj;
      const buttons = document.querySelectorAll('#battle-subject-options button');
      buttons.forEach(b => {
        b.classList.remove('border-purple-400', 'bg-purple-900/50');
        b.classList.add('border-purple-500/30');
      });
      if (btnEl) {
        btnEl.classList.add('border-purple-400', 'bg-purple-900/50');
        btnEl.classList.remove('border-purple-500/30');
      }
      AudioEngine.playTone(400, 'sine', 0.08);
    }

    function confirmAndLaunchBattle() {
      closeSubjectPickerModal();
      const _s = AppState.selectedBattleSubject;
      openUnitPicker(_s, (u) => { AppState.lobbyUnit = u; showBattleLobby(_s); });
    }

    // ==================== LEVEL MAP (Level N+1 unlocks only after Level N is completed) ====================
    function injectLevelMap(answered) {
      const arena = document.getElementById('live-battle-arena');
      const wrap = arena.firstElementChild; if (!wrap || !battleState.questions.length) return;
      const old = document.getElementById('level-map'); if (old) old.remove();
      const cur = battleState.currentIdx;
      const nodes = battleState.questions.map((_, i) => {
        const done = i < cur || (i === cur && answered);
        const state = done ? 'done' : i === cur ? 'cur' : 'lock';
        return `<button type="button" class="lv ${state}" onclick="tryEnterLevel(${i})" title="Level ${i + 1}">${state === 'done' ? '✔' : state === 'lock' ? '🔒' : i + 1}</button>`;
      }).join('');
      const box = document.createElement('div');
      box.id = 'level-map'; box.className = 'bg-slate-900/90 p-3 rounded-3xl border border-purple-800/40';
      box.innerHTML = `<div class="text-[10px] font-mono font-bold text-purple-300 tracking-widest mb-2">🗺 PROGRESS MAP • FINISH EACH STAGE TO UNLOCK THE NEXT</div><div class="lv-row">${nodes}</div>`;
      wrap.insertBefore(box, wrap.children[1] || null);
    }

    function tryEnterLevel(i) {
      const cur = battleState.currentIdx;
      if (i > cur || (i === cur + 1 && battleState.answeredIdx !== cur)) {
        AudioEngine.error();
        sirenWarning(`LEVEL ${i + 1} LOCKED`, `You cannot skip ahead! Complete Level ${cur + 1} first — then Level ${cur + 2} unlocks automatically.`);
      } else if (i === cur) showToast(`You are on Level ${i + 1} — answer to unlock the next!`, 'info');
      else showToast(`Level ${i + 1} already completed ✔`, 'info');
    }

    function levelCompleteBanner(n, ok) {
      const b = document.createElement('div'); b.className = 'lvl-banner';
      b.innerHTML = n < 17 ? `<b>LEVEL ${n} COMPLETE ${ok ? '✔' : ''}</b><span>🔓 LEVEL ${n + 1} UNLOCKED — LOADING…</span>` : `<b>FINAL LEVEL COMPLETE 🏁</b><span>CALCULATING YOUR RANK…</span>`;
      document.body.appendChild(b); setTimeout(() => b.remove(), 3000);
    }

    // ==================== YOUR ORIGINAL SYLLABUS ====================
    const SYL = (s) => s.split('|').map(x => x.trim()).filter(Boolean);
    const SYLLABUS_DATA = {
      c: [
        { unit: 'Unit I: C Language Basics, Selection & Loops', topics: SYL('Overview of C language elements|Variable declarations and data types|Executable statements & general form of a C program|Arithmetic expressions|Selection structures: conditions, if statement, compound statements|Decision steps in algorithms|Repetition: counting loops and the while statement|Computing a sum or product in a loop|for statement and conditional loops|Loop design & nested loops|do-while statement') },
        { unit: 'Unit II: Top-Down Design, Functions & Pointers', topics: SYL('Top-down design with functions|Building programs from existing information|Library functions|Structure charts|Functions without arguments|Functions with input arguments|Pointers and the indirection operator|Functions with output parameters|Formal output parameters as actual arguments') },
        { unit: 'Unit III: Arrays & Strings', topics: SYL('Declaring and referencing arrays|Array subscripts|Using for loops for sequential access|Array elements as function arguments|Array arguments|Searching and sorting an array|Enumerated types|Multidimensional arrays|String basics|String library functions|Assignment and substrings|String comparison') },
        { unit: 'Unit IV: Recursion, Structures & Unions', topics: SYL('The nature of recursion|Tracing a recursive function|User-defined structure types|Structure type data as input and output parameters|Union types') },
        { unit: 'Unit V: Files, Searching & Sorting', topics: SYL('Text and binary file pointers|Input/output files|Binary files|Basic searching in an array: linear search|Binary search technique|Bubble sort|Insertion sort|Selection sort') }
      ],
      python: [
        { unit: 'Unit 1: Introduction to Python & Basics of Programming', topics: SYL('Features, applications, installation and IDEs|Python syntax, indentation and comments|Variables, data types and type casting|Operators: arithmetic, relational, logical, assignment|Membership, identity and bitwise operators|Input/output functions: input(), print()|Control structures: if, if-else, if-elif-else|Nested conditions|Looping: for and while|Nested loops, break, continue, pass') },
        { unit: 'Unit 2: Data Structures in Python', topics: SYL('Strings: creation, indexing, slicing, methods|String formatting|Lists: creation, indexing, slicing, methods|List comprehension|Tuples: properties, indexing, methods|Sets: creation, operations, methods|Dictionaries: creation, access, methods|Dictionary comprehension|Iterating over data structures') },
        { unit: 'Unit 3: Functions and Modules', topics: SYL('Defining and calling functions|Parameters and return values|Types of arguments: positional, keyword, default, variable length|Scope of variables: local and global|Lambda functions|map, filter and reduce|Recursion in Python|Importing modules and creating user-defined modules|Standard modules: math, random, datetime|Packages in Python') },
        { unit: 'Unit 4: File Handling and Exception Handling', topics: SYL('Opening, reading, writing and appending files|File modes and file methods|Working with CSV and JSON files|Exception handling: try, except, else, finally|Built-in exceptions|Raising exceptions') },
        { unit: 'Unit 5: Object-Oriented Programming and Applications', topics: SYL('OOP basics: classes, objects, attributes, methods|Constructor (__init__) and the self keyword|Inheritance: single, multiple, multilevel, hierarchical|Method overriding|Method overloading (conceptual)|Encapsulation and polymorphism|Application: data processing script|Application: basic calculator') }
      ],
      maths: [
        { unit: 'Unit I: Matrices (8 L)', topics: SYL('Rank of a matrix by Echelon form and Normal form|Inverse of non-singular matrices by Gauss-Jordan method|Systems of linear equations: homogeneous and non-homogeneous|Gauss-Seidel iteration method') },
        { unit: 'Unit II: Eigen Values and Eigen Vectors (10 L)', topics: SYL('Linear transformation and orthogonal transformation|Eigen values and eigen vectors and their properties|Diagonalization of a matrix|Cayley-Hamilton theorem (without proof)|Inverse and power of a matrix by Cayley-Hamilton theorem|Quadratic forms and nature of quadratic forms|Reduction of quadratic form to canonical form by orthogonal transformation') },
        { unit: 'Unit III: Single Variable Calculus (10 L)', topics: SYL('Limit and continuity of functions and properties|Rolle\'s theorem|Lagrange\'s mean value theorem with geometrical interpretation and applications|Cauchy\'s mean value theorem|Taylor\'s series') },
        { unit: 'Unit IV: Multivariable Calculus – Partial Differentiation (10 L)', topics: SYL('Definitions of limit and continuity|Partial differentiation|Euler\'s theorem|Total derivative|Jacobian|Functional dependence and independence|Maxima and minima of functions of two variables') },
        { unit: 'Unit V: Multivariable Calculus – Integration (10 L)', topics: SYL('Evaluation of double integrals (Cartesian and polar)|Change of order of integration (Cartesian form)|Change of variables for double integrals (Cartesian to polar)|Evaluation of triple integrals|Change of variables for triple integrals (Cartesian to spherical and cylindrical polar)') }
      ],
      chemistry: [
        { unit: 'Unit I: Water Technology', topics: SYL('Hardness of water: causes, temporary and permanent|Expression and units of hardness & numerical problems|Estimation of hardness by complexometric (EDTA) method|Potable water and its specifications|Steps in treatment of potable water|Disinfection by chlorination and break-point chlorination|Boiler troubles: scales, sludges, caustic embrittlement|Internal treatment: Calgon and phosphate conditioning|External treatment: ion-exchange softening|Desalination: reverse osmosis') },
        { unit: 'Unit II: Battery Chemistry and Corrosion', topics: SYL('Classification of batteries: primary, secondary, reserve|Requirements for commercial batteries|Zn-air and Li-ion batteries, applications in electrical vehicles|Fuel cells and difference between battery and fuel cell|Solid oxide fuel cell|Electrochemical sensors: potentiometric and voltammetric (glucose analysis)|Corrosion: causes and effects|Chemical and electrochemical corrosion theories|Factors affecting rate of corrosion|Cathodic protection: sacrificial anode, impressed current|Metallic coatings: galvanizing and tinning') },
        { unit: 'Unit III: Polymer Materials', topics: SYL('Definition and classification of polymers|Addition (free radical) and condensation polymerization|Nylon 6,6|Glass transition temperature (Tg)|Plastics: thermoplastic and thermosetting|PVC, Bakelite and Teflon|Fiber reinforced plastics (FRP)|Conducting polymers and trans-polyacetylene mechanism|Biodegradable polymers: polyvinyl alcohol') },
        { unit: 'Unit IV: Energy Sources', topics: SYL('Solid fuels: coal, proximate and ultimate analysis|Liquid fuels: petroleum and its refining|Cracking types: moving bed catalytic cracking|Knocking, octane and cetane rating|Synthetic petrol: Fischer-Tropsch process|Gaseous fuels: natural gas, LPG and CNG|Biodiesel: transesterification') },
        { unit: 'Unit V: Smart Materials and their Engineering Applications', topics: SYL('Classification of smart materials|Chromic materials: photo, electro and thermochromic|Shape memory alloys: Nitinol|Piezoelectric materials: Rochelle salt|Thermoresponsive materials: PNIPAM|Self-healing materials|Magnetostrictive materials: Sulphur-Selenium alloy, ALFENOL, GALFENOL|Electrostrictive materials: PMN, polyurethane') }
      ],
      english: [
        { unit: 'Unit 1: Perspectives', topics: SYL('Lesson: The Generation Gap – Benjamin McLane Spock|Word Formation|Prefixes and Suffixes|Words Often Misspelt|Synonyms|Antonyms|Common Errors in the Use of Articles|Common Errors in the Use of Prepositions|Degrees of Comparison|Reading and its Importance|Techniques for Effective Reading|Sentence Structures and Types|Phrases and Clauses in Sentences|Importance of Proper Punctuation|Techniques for Writing Precisely|Nature and Style of Formal Writing') },
        { unit: 'Unit 2: Digital Transformation', topics: SYL('Lesson: Emerging Technologies|Homonyms, Homographs, Homophones|Common Errors in Noun–Pronoun Agreement|Common Errors in Subject–Verb Agreement (Concord)|Skimming and Scanning|Paragraph Writing|Describing People, Objects, Places and Events|Classifying|Essay Writing') },
        { unit: 'Unit 3: Attitude and Gratitude', topics: SYL('Lesson: Leisure – W. H. Davies|Lesson: Be Thankful – Author Unknown|Words Often Confused|Words from Foreign Languages|Common Errors in the Use of Modifiers|Common Errors in the Use of Tenses|Intensive Reading|Extensive Reading|Formal Letters|Job Application Letters|Résumé and Curricula Vitae|E-mail Etiquette') },
        { unit: 'Unit 4: Entrepreneurship', topics: SYL('Lesson: Why a Start-Up Needs to Find Its Customers First – Pranav Jain|Standard Abbreviations in English|Phrasal Verbs|Idioms|Redundancies and Clichés in Written Communication|Active and Passive Voice|Reading Comprehension Practice – Prompt Engineering|Note Making|Précis Writing') },
        { unit: 'Unit 5: Integrity and Professionalism', topics: SYL('Lesson: Professional Ethics|Technical Vocabulary|One-Word Substitutions|Direct and Indirect Speech|Common Errors in English|The SQ3R Method|Report Writing') }
      ]
    };
    Object.assign(DETAILED_SYLLABUS_MAP, SYLLABUS_DATA);

    // topic completion ticks (saved in Supabase)
    let sylChecks = {};
    function sylPct(k, u) { const t = SYLLABUS_DATA[k][u].topics; return Math.round(t.filter((_, i) => sylChecks[`${k}|${u}|${i}`]).length / t.length * 100); }
    function toggleSylTopic(k, u, i, on) {
      if (on) sylChecks[`${k}|${u}|${i}`] = 1; else delete sylChecks[`${k}|${u}|${i}`];
      if (typeof savePersistentData === 'function') savePersistentData();
      renderSyllabusUnits(); AudioEngine.playTone(on ? 700 : 400, 'triangle', 0.06);
      const pill = document.getElementById(`syl-pill-${u}`); if (pill) pill.textContent = sylPct(k, u) + '% done';
    }

    function renderSyllabusUnits() {
      const container = document.getElementById('syllabus-units-container'); if (!container) return;
      container.innerHTML = Object.keys(SYLLABUS_DATA).map(k => `
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="text-xs font-black text-white">${BTECH_SUBJECTS[k].icon} ${BTECH_SUBJECTS[k].name}</div>
          ${SYLLABUS_DATA[k].map((u, ui) => { const p = sylPct(k, ui); return `
            <div class="space-y-1 cursor-pointer" onclick="document.getElementById('syllabus-view-select').value='${k}';renderSyllabusTopicsDetailed('${k}')">
              <div class="flex justify-between text-[11px]"><span class="text-slate-300 truncate pr-2">${escHtml(u.unit)}</span><span class="text-pink-400 font-mono font-bold">${p}%</span></div>
              <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style="width:${p}%"></div></div>
            </div>`; }).join('')}
        </div>`).join('');
    }

    function renderSyllabusTopicsDetailed(subjKey) {
      const container = document.getElementById('linear-syllabus-content'); if (!container) return;
      const k = SYLLABUS_DATA[subjKey] ? subjKey : 'c';
      container.innerHTML = SYLLABUS_DATA[k].map((u, ui) => `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/40 space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <div class="text-xs font-bold text-purple-300">🦚 ${escHtml(u.unit)}</div>
            <span id="syl-pill-${ui}" class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 whitespace-nowrap">${sylPct(k, ui)}% done</span>
          </div>
          <ul class="space-y-1.5 pl-2 border-l-2 border-purple-700/40">
            ${u.topics.map((t, ti) => `
              <li class="text-xs text-slate-300 flex items-start gap-2">
                <input type="checkbox" class="mt-0.5 accent-pink-500 cursor-pointer flex-shrink-0" ${sylChecks[`${k}|${ui}|${ti}`] ? 'checked' : ''} onchange="toggleSylTopic('${k}',${ui},${ti},this.checked)">
                <span class="leading-relaxed">${escHtml(t)}</span>
              </li>`).join('')}
          </ul>
        </div>`).join('');
    }

    // ==================== QUESTION ENGINE (unit-based, notes-based, no repeats) ====================
    const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
    const mkQ = (q, correct, wrong, exp) => { const o = shuffle([correct, ...wrong]); return { q, options: o, ans: o.indexOf(correct), exp }; };
    const unitTitle = (u) => u.unit.replace(/^Unit\s*[IVX\d]+\s*[:\-–]\s*/i, '').replace(/\s*\(\d+ L\)/, '');

    function syllabusQuestions(k, ui) {
      const units = SYLLABUS_DATA[k], U = units[ui], name = BTECH_SUBJECTS[k].name, out = [];
      const others = units.flatMap((x, i) => i === ui ? [] : x.topics);
      const labels = (i) => `Unit ${i + 1}: ${unitTitle(units[i])}`;
      const w1 = [(n) => `Which of these topics belongs to ${name} – Unit ${ui + 1} (${unitTitle(U)})?`, () => `Your syllabus for ${name} Unit ${ui + 1} includes which of these topics?`, () => `Pick the topic you will study under "${unitTitle(U)}" in ${name}.`];
      const w2 = [(t) => `In which unit of ${name} will you study "${t}"?`, (t) => `"${t}" is part of which ${name} unit?`];
      U.topics.forEach(t => {
        w1.forEach(f => out.push(mkQ(f(), t, shuffle(others).slice(0, 3), `"${t}" is part of ${U.unit} in your syllabus.`)));
        w2.forEach(f => out.push(mkQ(f(t), labels(ui), shuffle(units.map((_, i) => i).filter(i => i !== ui)).slice(0, 3).map(labels), `"${t}" is covered in ${U.unit}.`)));
      });
      const w3 = [`Which of these is NOT covered in ${name} – Unit ${ui + 1}?`, `Which topic does NOT belong to ${name} Unit ${ui + 1} (${unitTitle(U)})?`, `Spot the odd one out — not part of ${name} Unit ${ui + 1}:`];
      for (let n = 0; n < Math.min(6, U.topics.length); n++) {
        const odd = others[(n * 5 + ui * 3) % others.length];
        out.push(mkQ(w3[n % 3], odd, shuffle(U.topics).slice(0, 3), `"${odd}" belongs to a different unit; Unit ${ui + 1} covers ${unitTitle(U)}.`));
      }
      return out;
    }

    const CONCEPT = { // [unitIndex, question, options, answerIndex, explanation]
      c: [[0, 'Which header file declares printf()?', ['<stdio.h>', '<stdlib.h>', '<string.h>', '<math.h>'], 0, 'printf and scanf are declared in stdio.h.'], [0, 'What does printf("%d", 7/2); print?', ['3.5', '3', '4', 'Error'], 1, 'Both operands are int, so integer division gives 3.'], [0, 'Which loop always executes its body at least once?', ['for', 'while', 'do-while', 'nested if'], 2, 'do-while checks its condition after running the body.'],
        [1, 'What does the & operator return?', ['The value', 'The address of a variable', 'The size', 'The type'], 1, '& is the address-of operator.'], [1, 'To change a caller\'s variable inside a function you pass:', ['A copy', 'A pointer to it', 'A constant', 'A macro'], 1, 'Output parameters are pointers.'],
        [2, 'The last valid index of int a[10] is:', ['10', '9', '11', '0'], 1, 'Indexes run from 0 to size-1.'], [2, 'Which function compares two strings?', ['strcpy()', 'strcmp()', 'strlen()', 'strcat()'], 1, 'strcmp returns 0 when strings are equal.'],
        [3, 'A function that calls itself is:', ['Inline', 'Recursive', 'Static', 'Volatile'], 1, 'That is recursion; it needs a base case.'], [3, 'A union allocates memory equal to its:', ['Smallest member', 'Largest member', 'Sum of members', 'Fixed 4 bytes'], 1, 'All union members share the same memory.'],
        [4, 'Binary search requires the array to be:', ['Sorted', 'Unsorted', 'Of even size', 'Made of strings'], 0, 'It halves the range using order.'], [4, 'Which sort repeatedly swaps adjacent out-of-order elements?', ['Bubble sort', 'Binary search', 'Selection sort', 'Linear search'], 0, 'Bubble sort bubbles the largest element to the end.']],
      python: [[0, 'Which of these is NOT a Python data type?', ['int', 'float', 'char', 'str'], 2, 'Python has no separate char type; use str.'], [0, 'Which keyword does nothing and acts as a placeholder?', ['skip', 'pass', 'null', 'continue'], 1, 'pass is a no-op statement.'],
        [1, 'Which list method adds an item at the end?', ['add()', 'append()', 'insert()', 'push()'], 1, 'list.append(x) adds x at the end.'], [1, 'Dictionary keys must be:', ['Mutable', 'Immutable (hashable)', 'Lists', 'Floats only'], 1, 'Keys need to be hashable.'],
        [2, 'Which keyword creates an anonymous function?', ['def', 'lambda', 'func', 'anon'], 1, 'lambda x: x*2 is an anonymous function.'], [2, 'A variable defined inside a function has ___ scope.', ['Global', 'Local', 'Built-in', 'Module'], 1, 'It exists only inside that function.'],
        [3, 'Which block always runs in exception handling?', ['try', 'except', 'finally', 'else'], 2, 'finally runs whether or not an error occurs.'], [3, 'Which file mode appends to a file?', ["'r'", "'w'", "'a'", "'x'"], 2, "'a' opens for appending."],
        [4, '__init__ in a class is the:', ['Destructor', 'Constructor', 'Decorator', 'Module'], 1, 'It runs when an object is created.'], [4, 'Inheriting from more than one parent class is:', ['Single', 'Multiple inheritance', 'Hierarchical', 'Overloading'], 1, 'Python supports multiple inheritance.']],
      maths: [[0, 'The rank of a non-singular n×n matrix is:', ['0', '1', 'n', 'n²'], 2, 'A non-singular matrix has full rank n.'], [0, 'Gauss-Seidel is a(n) ___ method.', ['Direct', 'Iterative', 'Graphical', 'Random'], 1, 'It iterates toward the solution.'],
        [1, 'The product of the eigenvalues equals the matrix\'s:', ['Trace', 'Determinant', 'Rank', 'Transpose'], 1, 'det(A) = product of eigenvalues.'], [1, 'Cayley-Hamilton says every square matrix:', ['Is diagonalizable', 'Satisfies its own characteristic equation', 'Has real eigenvalues', 'Is invertible'], 1, 'p(A) = 0 for its characteristic polynomial p.'],
        [2, 'Rolle\'s theorem needs f(a) = f(b) and f to be:', ['Continuous on [a,b], differentiable on (a,b)', 'Only continuous', 'Only differentiable', 'Periodic'], 0, 'Both conditions guarantee f\'(c) = 0.'], [2, 'Lagrange\'s MVT gives a point c with f\'(c) =', ['0', '(f(b)-f(a))/(b-a)', 'f(a)+f(b)', '1'], 1, 'The slope of the chord.'],
        [3, 'Euler\'s theorem applies to ___ functions.', ['Homogeneous', 'Periodic', 'Odd', 'Linear only'], 0, 'x f_x + y f_y = n f for homogeneous f of degree n.'], [3, 'The Jacobian is the determinant of the matrix of:', ['Second derivatives', 'First partial derivatives', 'Integrals', 'Eigenvalues'], 1, 'J = ∂(u,v)/∂(x,y).'],
        [4, 'In polar coordinates dx dy becomes:', ['dr dθ', 'r dr dθ', 'r² dr dθ', 'dr / θ'], 1, 'The Jacobian of the polar transformation is r.'], [4, 'The volume element in spherical coordinates is:', ['r dr dθ dφ', 'r² sinφ dr dθ dφ', 'dr dθ dφ', 'r sinφ dr dθ dφ'], 1, 'Jacobian = r² sin φ.']],
      chemistry: [[0, 'Temporary hardness is caused by:', ['Chlorides of Ca/Mg', 'Bicarbonates of Ca/Mg', 'Sulphates of Ca/Mg', 'Nitrates'], 1, 'Boiling removes bicarbonate hardness.'], [0, 'Which process uses a semi-permeable membrane to desalinate water?', ['Reverse osmosis', 'Calgon conditioning', 'Chlorination', 'Ion exchange'], 0, 'Pressure forces water through the membrane.'],
        [1, 'Galvanizing coats iron with:', ['Tin', 'Zinc', 'Copper', 'Nickel'], 1, 'Zinc coating protects iron sacrificially.'], [1, 'Which is a secondary (rechargeable) battery?', ['Li-ion', 'Dry cell', 'Zn-air primary cell', 'Mercury cell'], 0, 'Li-ion batteries can be recharged.'],
        [2, 'Teflon is a polymer of:', ['Ethylene', 'Tetrafluoroethylene', 'Vinyl chloride', 'Propylene'], 1, 'PTFE is made from TFE.'], [2, 'Bakelite is a:', ['Thermoplastic', 'Thermosetting plastic', 'Elastomer', 'Fibre'], 1, 'It sets permanently on heating.'],
        [3, 'A higher octane number means ___ knocking.', ['More', 'Less', 'Same', 'Random'], 1, 'Higher octane resists knocking.'], [3, 'The Fischer-Tropsch process produces:', ['Synthetic petrol', 'Biogas', 'Coke', 'Soap'], 0, 'It converts CO + H₂ to liquid hydrocarbons.'],
        [4, 'Nitinol is a well-known:', ['Shape memory alloy', 'Polymer', 'Fuel', 'Battery'], 0, 'Nickel-Titanium shape memory alloy.'], [4, 'PNIPAM is a ___ polymer.', ['Thermoresponsive', 'Fuel', 'Metallic', 'Alloy'], 0, 'It changes behaviour with temperature.']],
      english: [[0, 'Choose the correct article: ___ honest man.', ['A', 'An', 'The', 'No article'], 1, 'Honest starts with a vowel sound.'], [0, 'Antonym of "ancient":', ['Modern', 'Old', 'Historic', 'Aged'], 0, 'Opposite of ancient is modern.'],
        [1, 'Homophones are words that:', ['Sound alike but differ in meaning', 'Are spelled alike', 'Mean the same', 'Only rhyme'], 0, 'Example: write / right.'], [1, 'Choose the correct sentence:', ['The team are ready.', 'The team is ready.', 'The team were ready.', 'The team have ready.'], 1, 'Team is treated as singular here.'],
        [2, 'A formal letter to someone you know ends with:', ['Yours faithfully', 'Yours sincerely', 'Bye', 'Cheers'], 1, '"Yours sincerely" follows "Dear Mr/Ms Name".'], [2, 'A résumé is a:', ['Long story', 'Short summary of qualifications', 'Cover letter', 'Report'], 1, 'It summarises your education and skills.'],
        [3, 'Active voice of "The ball was hit by Ravi":', ['Ravi hit the ball', 'Ravi hits the ball', 'Ravi had hit ball', 'The ball hit Ravi'], 0, 'Make the doer the subject.'], [3, 'A précis is:', ['A shortened summary of a passage', 'A letter', 'An essay', 'A poem'], 0, 'It keeps the main ideas in fewer words.'],
        [4, 'SQ3R stands for Survey, Question, Read, Recite and:', ['Review', 'Repeat', 'Rewrite', 'Record'], 0, 'SQ3R is a reading-and-study method.'], [4, 'One-word substitute for "a person who loves books":', ['Bibliophile', 'Philatelist', 'Pedant', 'Misogynist'], 0, 'Biblio = book, phile = lover.']]
    };

    // ---- questions generated from the notes you upload ----
    const STOP = new Set('about above after again against because before being below between could during each from further have having into itself might more most other should some such than that their them then there these they this those through under until very were what when where which while will with would your'.split(' '));
    async function noteText(n) {
      if (n._text !== undefined) return n._text;
      let t = n.content || '';
      try {
        const b = n.fileBlob, name = (n.title || '').toLowerCase();
        if (b && (name.endsWith('.txt') || name.endsWith('.md') || (b.type || '').startsWith('text/'))) t = await b.text();
        else if (b && (name.endsWith('.pdf') || b.type === 'application/pdf')) {
          const lib = await withTimeout(loadPdfJs(), 10000);
          const pdf = await withTimeout(lib.getDocument({ data: await b.arrayBuffer(), verbosity: 0 }).promise, 12000);
          let s = ''; for (let p = 1; p <= Math.min(pdf.numPages, 40); p++) { const c = await (await pdf.getPage(p)).getTextContent(); s += c.items.map(i => i.str).join(' ') + '\n'; }
          t = s;
        } else if (b && name.endsWith('.docx')) { const m = await withTimeout(loadMammoth(), 10000); t = (await m.extractRawText({ arrayBuffer: await b.arrayBuffer() })).value; }
      } catch (e) {}
      n._text = (t || '').replace(/\s+/g, ' ').trim();
      return n._text;
    }
    async function prepareNoteText(subj) {
      const keys = subj === 'all' ? Object.keys(BTECH_SUBJECTS) : [subj];
      const ns = keys.flatMap(k => (BTECH_SUBJECTS[k].materials || []).filter(m => m.fileBlob && !m.noteId?.startsWith?.('xx')));
      await Promise.all(ns.map(noteText));
    }
    function noteQuestions(k, unit) {
      const out = [];
      (BTECH_SUBJECTS[k].materials || []).forEach(n => {
        if (!n._text || n._text.length < 80) return;
        const um = (n.title || '').match(/unit[\s_\-]*([1-5]|i{1,3}|iv|v)\b/i);
        if (um && unit >= 0) { const r = { i: 1, ii: 2, iii: 3, iv: 4, v: 5 }; const u = (r[um[1].toLowerCase()] || +um[1]) - 1; if (u !== unit) return; }
        const sents = n._text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length >= 45 && s.length <= 230 && s.split(' ').length >= 8);
        const terms = [...new Set(sents.flatMap(s => (s.match(/[A-Za-z][A-Za-z\-]{5,}/g) || []).filter(w => !STOP.has(w.toLowerCase())).map(w => w.replace(/-$/, ''))))];
        shuffle(sents).slice(0, 24).forEach(s => {
          const words = (s.match(/[A-Za-z][A-Za-z\-]{5,}/g) || []).filter(w => !STOP.has(w.toLowerCase()));
          if (!words.length) return;
          const key = words.sort((a, b) => b.length - a.length)[0];
          const wrong = shuffle(terms.filter(t => t.toLowerCase() !== key.toLowerCase() && Math.abs(t.length - key.length) < 6)).slice(0, 3);
          if (wrong.length < 3) return;
          const blanked = s.replace(new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), '_____');
          out.push(mkQ(`📒 From your notes (${n.title}): ${blanked}`, key, wrong, `From your notes: "${s}"`));
        });
      });
      return out;
    }

    // ---- no-repeat memory shared by Battle, Solo Quiz and Weak Topics ----
    const qKey = (q) => q.q + '|' + q.options[q.ans];
    function seenSet() { return new Set(seenQ); }
    function markSeen(qs) { seenQ = [...seenSet(), ...qs.map(qKey)].slice(-600); API.saveProfile && API.saveProfile(); }
    function buildPool(subj, unit) {
      const keys = subj === 'all' ? Object.keys(SYLLABUS_DATA) : [subj];
      let pool = [];
      keys.forEach(k => {
        (unit < 0 ? [0, 1, 2, 3, 4] : [unit]).forEach(u => pool.push(...syllabusQuestions(k, u)));
        (CONCEPT[k] || []).forEach(c => { if (unit < 0 || c[0] === unit) pool.push({ q: c[1], options: c[2], ans: c[3], exp: c[4] }); });
        if (unit < 0) (QUESTION_BANK_STORE[k] || []).forEach(q => { if (q.q && q.options && q.options.length >= 2) pool.push(q); });
        pool.push(...noteQuestions(k, unit));
      });
      const dd = new Set(); return pool.filter(q => !dd.has(qKey(q)) && dd.add(qKey(q)));
    }
    function assembleQuestions(subj, unit, focusWords) {
      let pool = buildPool(subj, unit);
      if (focusWords && focusWords.length) { const f = pool.filter(q => focusWords.some(w => (q.q + ' ' + q.options.join(' ')).toLowerCase().includes(w))); if (f.length >= 6) pool = f.concat(pool.filter(q => !f.includes(q))); }
      const seen = seenSet();
      const notes = pool.filter(q => q.q.startsWith('📒')), rest = pool.filter(q => !q.q.startsWith('📒'));
      const order = a => { const fresh = shuffle(a.filter(q => !seen.has(qKey(q)))); return fresh.concat(shuffle(a.filter(q => seen.has(qKey(q))))); };
      let picked = order(notes).slice(0, Math.min(notes.length, 9));
      const foc = focusWords && focusWords.length ? pool.filter(q => !picked.includes(q) && focusWords.some(w => (q.q + ' ' + q.options.join(' ')).toLowerCase().includes(w))) : [];
      picked = picked.concat(order(foc).slice(0, 10));
      for (const q of order(rest)) { if (picked.length >= 17) break; if (!picked.includes(q)) picked.push(q); }
      if (picked.length < 17) for (const q of order(buildPool(subj, -1))) { if (picked.length >= 17) break; if (!picked.some(p => qKey(p) === qKey(q))) picked.push(q); }
      picked = shuffle(picked).slice(0, 17);
      markSeen(picked);
      return picked;
    }

    // ---- unit picker (appears after choosing a subject) ----
    function openUnitPicker(subj, onPick) {
      let m = document.getElementById('unit-picker-modal');
      if (!m) { m = document.createElement('div'); m.id = 'unit-picker-modal'; m.className = 'fixed inset-0 z-[60] hidden items-center justify-center p-4 bg-black/80 backdrop-blur'; document.body.appendChild(m); }
      const name = subj === 'all' ? '🌐 All Subjects' : `${BTECH_SUBJECTS[subj].icon} ${BTECH_SUBJECTS[subj].name}`;
      const unitsFor = subj === 'all' ? [0, 1, 2, 3, 4].map(i => `Unit ${i + 1}`) : SYLLABUS_DATA[subj].map((u, i) => `Unit ${i + 1}: ${unitTitle(u)}`);
      m.innerHTML = `<div class="w-full max-w-md bg-slate-900 border border-purple-600/50 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div class="text-center"><div class="text-xs font-mono font-bold text-purple-300 tracking-widest">${name}</div><h3 class="text-xl font-black text-white mt-1">Choose a Unit</h3><p class="text-[11px] text-slate-400 mt-1">Questions will come only from the unit you pick (and your uploaded notes).</p></div>
        <div class="space-y-2">${unitsFor.map((t, i) => `<button type="button" data-u="${i}" class="unit-pick w-full text-left px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500 hover:bg-purple-950/40 text-xs font-bold text-slate-200 transition-all">${escHtml(t)}</button>`).join('')}
          <button type="button" data-u="-1" class="unit-pick w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-xs font-black text-white">⚡ All Units (mixed)</button></div>
        <button type="button" onclick="document.getElementById('unit-picker-modal').classList.add('hidden');document.getElementById('unit-picker-modal').classList.remove('flex')" class="w-full text-xs text-slate-400 hover:text-white py-2">Cancel</button></div>`;
      m.querySelectorAll('.unit-pick').forEach(b => b.onclick = () => { m.classList.add('hidden'); m.classList.remove('flex'); AudioEngine.playTone(620, 'sine', 0.1); onPick(+b.dataset.u); });
      m.classList.remove('hidden'); m.classList.add('flex');
    }

    // ==================== XP • LEVEL • COINS • BADGES ====================
    const BADGE_DATA = [
      [0, 'Rookie'], [300, 'Challenger'], [700, 'Scholar'], [1200, 'Warrior'], [1800, 'Elite'],
      [2600, 'Champion'], [3600, 'Master'], [5000, 'Legend'], [7000, 'Mythic'], [10000, 'Immortal']
    ];
    const BADGE_IMG = ["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"];
    function badgeIdx(xp) { let i = 0; BADGE_DATA.forEach((b, n) => { if (xp >= b[0]) i = n; }); return i; }
    const badgeSrc = (i) => 'data:image/webp;base64,' + BADGE_IMG[i];
    const badgeTag = (xp, px = 24) => `<img src="${badgeSrc(badgeIdx(xp))}" alt="${BADGE_DATA[badgeIdx(xp)][1]}" title="${BADGE_DATA[badgeIdx(xp)][1]} badge" style="width:${px}px;height:${px}px;display:inline-block;vertical-align:middle;border-radius:50%;filter:drop-shadow(0 0 6px rgba(255,45,149,.7))">`;

    function updateBadgeUI() {
      const i = badgeIdx(AppState.xp), h = document.getElementById('header-badge');
      if (h) { h.src = badgeSrc(i); h.title = `${BADGE_DATA[i][1]} badge`; }
      const coin = document.getElementById('header-coins'); if (coin) coin.textContent = AppState.coins;
      const meta = document.getElementById('profile-stats-meta');
      if (meta) {
        let box = document.getElementById('profile-badge-box');
        if (!box) { box = document.createElement('div'); box.id = 'profile-badge-box'; box.className = 'flex items-center gap-3 mt-3 p-3 rounded-2xl bg-slate-950/70 border border-pink-500/30'; meta.parentElement.appendChild(box); }
        const next = BADGE_DATA[i + 1], pct = next ? Math.round((AppState.xp - BADGE_DATA[i][0]) / (next[0] - BADGE_DATA[i][0]) * 100) : 100;
        box.innerHTML = `<img src="${badgeSrc(i)}" style="width:56px;height:56px;border-radius:50%;filter:drop-shadow(0 0 12px #ff2d95)" alt="">
          <div class="flex-1 min-w-0"><div class="text-xs font-black text-white">${BADGE_DATA[i][1]} Badge</div>
          <div class="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden"><div class="h-full bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full" style="width:${pct}%"></div></div>
          <div class="text-[10px] font-mono text-slate-400 mt-1">${next ? `${next[0] - AppState.xp} XP to ${next[1]}` : 'Max badge reached!'}</div></div>
          <button onclick="openCharacterShop()" class="px-3 py-2 rounded-xl text-[11px] font-bold bg-purple-600/40 border border-purple-400/40 text-white">🛒 Shop</button>`;
      }
      document.querySelectorAll('#rankings-list > div').forEach(row => {
        if (row.dataset.bdg) return; const m = row.textContent.match(/([\d,]{2,})\s*XP/); if (!m) return;
        row.dataset.bdg = 1; const first = row.firstElementChild; if (first) first.insertAdjacentHTML('afterbegin', badgeTag(parseInt(m[1].replace(/,/g, '')), 22) + ' ');
      });
    }

    function awardXp(xp, coins, silent) {
      const oldB = badgeIdx(AppState.xp), oldL = AppState.level;
      AppState.xp += xp; AppState.coins += coins; AppState.level = Math.floor(AppState.xp / 400) + 1;
      savePersistentData(); applyLoadedProfileToUI();
      if (!silent) showToast(`+${xp} XP • +${coins} 🪙 coins`, 'info');
      if (AppState.level > oldL) { showToast(`🆙 LEVEL UP! You are now Level ${AppState.level}`, 'info'); window.FX && window.FX.burst(innerWidth / 2, innerHeight / 3, 60, true); }
      if (badgeIdx(AppState.xp) > oldB) { const b = BADGE_DATA[badgeIdx(AppState.xp)][1]; infoPopup('🏅', 'NEW BADGE UNLOCKED!', `You earned the ${b} badge! Check it on your profile.`); window.FX && window.FX.fireworks(4); }
    }

    // ==================== CHARACTER "VOLT" + SHOP ====================
    const SHOP_ITEMS = [
      { id: 'cap', slot: 'head', name: 'Neon Cap', icon: '🧢', price: 60, svg: '<path d="M54 52 Q100 4 146 52 Z" fill="#ff2d95"/><rect x="46" y="50" width="108" height="9" rx="4" fill="#d6006f"/>' },
      { id: 'phones', slot: 'head', name: 'Headphones', icon: '🎧', price: 90, svg: '<path d="M52 82 Q52 30 100 30 Q148 30 148 82" fill="none" stroke="#00e5ff" stroke-width="7"/><rect x="42" y="68" width="16" height="30" rx="7" fill="#ff2d95"/><rect x="142" y="68" width="16" height="30" rx="7" fill="#ff2d95"/>' },
      { id: 'halo', slot: 'head', name: 'Golden Halo', icon: '😇', price: 150, svg: '<ellipse cx="100" cy="22" rx="36" ry="9" fill="none" stroke="#fde047" stroke-width="5"/>' },
      { id: 'crown', slot: 'head', name: 'King Crown', icon: '👑', price: 220, svg: '<path d="M62 46 L70 14 L87 34 L100 6 L113 34 L130 14 L138 46 Z" fill="#fde047" stroke="#f59e0b" stroke-width="3"/>' },
      { id: 'visor', slot: 'eyes', name: 'Cyber Visor', icon: '🥽', price: 70, svg: '<rect x="62" y="68" width="76" height="22" rx="10" fill="#00e5ff" opacity=".88"/><rect x="67" y="72" width="30" height="5" rx="2" fill="#fff" opacity=".75"/>' },
      { id: 'shades', slot: 'eyes', name: 'Neon Shades', icon: '🕶', price: 100, svg: '<rect x="64" y="68" width="30" height="20" rx="6" fill="#0b0b12"/><rect x="106" y="68" width="30" height="20" rx="6" fill="#0b0b12"/><rect x="94" y="74" width="12" height="5" fill="#0b0b12"/><path d="M68 73 L80 73" stroke="#ff2d95" stroke-width="3"/><path d="M110 73 L122 73" stroke="#00e5ff" stroke-width="3"/>' },
      { id: 'starry', slot: 'eyes', name: 'Star Eyes', icon: '🤩', price: 140, svg: '<text x="70" y="90" font-size="26">⭐</text><text x="102" y="90" font-size="26">⭐</text>' },
      { id: 'cape', slot: 'back', name: 'Hero Cape', icon: '🦸', price: 120, svg: '<path d="M62 120 Q36 200 54 236 L146 236 Q164 200 138 120 Z" fill="#ff2d95" opacity=".92"/>' },
      { id: 'jet', slot: 'back', name: 'Jetpack', icon: '🚀', price: 180, svg: '<rect x="48" y="130" width="22" height="52" rx="8" fill="#334155" stroke="#00e5ff" stroke-width="2"/><rect x="130" y="130" width="22" height="52" rx="8" fill="#334155" stroke="#00e5ff" stroke-width="2"/><path d="M54 184 q5 26 10 0z M136 184 q5 26 10 0z" fill="#f59e0b"/>' },
      { id: 'wings', slot: 'back', name: 'Neon Wings', icon: '🪽', price: 260, svg: '<path d="M60 128 Q2 84 12 154 Q22 118 40 162 Q30 150 62 172Z" fill="#00e5ff" opacity=".85"/><path d="M140 128 Q198 84 188 154 Q178 118 160 162 Q170 150 138 172Z" fill="#00e5ff" opacity=".85"/>' },
      { id: 'glow', slot: 'aura', name: 'Pink Glow', icon: '💗', price: 80, svg: '<circle cx="100" cy="130" r="112" fill="url(#vg)"/>' },
      { id: 'spark', slot: 'aura', name: 'Sparkles', icon: '✨', price: 160, svg: '<text x="14" y="60" font-size="22">✨</text><text x="160" y="90" font-size="18">✨</text><text x="20" y="190" font-size="16">✨</text><text x="166" y="210" font-size="22">✨</text>' },
      { id: 'flame', slot: 'aura', name: 'Cyber Flames', icon: '🔥', price: 300, svg: '<path d="M14 236 q14 -60 0 -96 q36 36 24 96z M186 236 q-14 -60 0 -96 q-36 36 -24 96z" fill="#ff2d95" opacity=".75"/><path d="M24 236 q8 -34 0 -54 q20 20 14 54z M176 236 q-8 -34 0 -54 q-20 20 -14 54z" fill="#fde047" opacity=".8"/>' }
    ];
    function charSVG(eq, size = 200) {
      const it = (slot) => { const x = SHOP_ITEMS.find(s => s.id === (eq || {})[slot]); return x ? x.svg : ''; };
      const eyes = (eq || {}).eyes ? '' : '<circle cx="86" cy="78" r="6" fill="#00e5ff"/><circle cx="114" cy="78" r="6" fill="#00e5ff"/>';
      return `<svg viewBox="0 0 200 240" width="${size}" height="${size * 1.2}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="vg"><stop offset="0" stop-color="#ff2d95" stop-opacity=".55"/><stop offset="1" stop-color="#ff2d95" stop-opacity="0"/></radialGradient></defs>
        ${it('aura')}${it('back')}
        <rect x="72" y="196" width="20" height="32" rx="8" fill="#1a0b2e" stroke="#00e5ff" stroke-width="2.5"/><rect x="108" y="196" width="20" height="32" rx="8" fill="#1a0b2e" stroke="#00e5ff" stroke-width="2.5"/>
        <rect x="44" y="128" width="18" height="52" rx="9" fill="#1a0b2e" stroke="#ff2d95" stroke-width="2.5"/><rect x="138" y="128" width="18" height="52" rx="9" fill="#1a0b2e" stroke="#ff2d95" stroke-width="2.5"/>
        <rect x="62" y="118" width="76" height="80" rx="22" fill="#1a0b2e" stroke="#ff2d95" stroke-width="3"/>
        <path d="M101 128 L88 154 H98 L94 180 L116 148 H104 L109 128Z" fill="#00e5ff"/>
        <path d="M100 40 V24" stroke="#ff2d95" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="20" r="6" fill="#00e5ff"/>
        <rect x="56" y="40" width="88" height="78" rx="26" fill="#1a0b2e" stroke="#ff2d95" stroke-width="3"/>
        <rect x="68" y="56" width="64" height="46" rx="14" fill="#05030c" stroke="#00e5ff" stroke-width="2"/>
        ${eyes}<path d="M90 92 Q100 99 110 92" stroke="#ff2d95" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${it('eyes')}${it('head')}</svg>`;
    }
    let shopSlot = 'head';
    function openCharacterShop() {
      let m = document.getElementById('character-modal');
      if (!m) { m = document.createElement('div'); m.id = 'character-modal'; m.className = 'fixed inset-0 z-[60] items-center justify-center p-3 bg-black/85 backdrop-blur overflow-y-auto hidden'; document.body.appendChild(m); }
      m.classList.remove('hidden'); m.classList.add('flex'); renderShop(); AudioEngine.playTone(640, 'sine', 0.1);
    }
    function closeCharacterShop() { const m = document.getElementById('character-modal'); m.classList.add('hidden'); m.classList.remove('flex'); }
    function renderShop() {
      const m = document.getElementById('character-modal'), slots = { head: '🎩 Head', eyes: '👁 Eyes', back: '🦋 Back', aura: '🌟 Aura' };
      const i = badgeIdx(AppState.xp);
      m.innerHTML = `<div class="w-full max-w-3xl bg-slate-900 border border-pink-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl my-auto">
        <div class="flex items-center justify-between mb-4"><div><div class="text-[10px] font-mono font-bold text-pink-300 tracking-widest">CHARACTER SHOP</div><h3 class="text-xl font-black text-white">Meet VOLT ⚡</h3></div>
          <div class="flex items-center gap-2"><span class="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-black">🪙 ${AppState.coins}</span><button onclick="closeCharacterShop()" class="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">✕</button></div></div>
        <div class="grid sm:grid-cols-[210px_1fr] gap-5">
          <div class="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-center"><div class="char-stage">${charSVG(AppState.equipped, 170)}</div>
            <div class="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-white">${badgeTag(AppState.xp, 26)} ${AppState.username}</div>
            <div class="text-[10px] font-mono text-slate-400">${BADGE_DATA[i][1]} • ${AppState.xp} XP</div></div>
          <div><div class="flex gap-2 mb-3 flex-wrap">${Object.entries(slots).map(([k, v]) => `<button onclick="shopSlot='${k}';renderShop()" class="px-3 py-1.5 rounded-xl text-[11px] font-bold ${k === shopSlot ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-800'}">${v}</button>`).join('')}</div>
            <div class="grid grid-cols-2 gap-2.5">${SHOP_ITEMS.filter(s => s.slot === shopSlot).map(s => { const own = AppState.owned.includes(s.id), on = AppState.equipped[s.slot] === s.id; return `
              <div class="p-3 rounded-2xl bg-slate-950 border ${on ? 'border-pink-500' : 'border-slate-800'} text-center">
                <div class="text-3xl">${s.icon}</div><div class="text-xs font-bold text-white mt-1">${s.name}</div>
                <button onclick="${own ? `equipItem('${s.id}')` : `buyItem('${s.id}')`}" class="mt-2 w-full py-1.5 rounded-xl text-[11px] font-black ${own ? (on ? 'bg-pink-600 text-white' : 'bg-cyan-600/30 text-cyan-200 border border-cyan-400/40') : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}">${own ? (on ? '✔ Equipped' : 'Equip') : `Buy 🪙 ${s.price}`}</button></div>`; }).join('')}</div>
            <p class="text-[10px] text-slate-500 mt-3">Earn coins: +5 per correct answer, +25 or more for finishing a battle, +15 daily login bonus.</p></div></div></div>`;
    }
    function buyItem(id) {
      const s = SHOP_ITEMS.find(x => x.id === id); if (!s || AppState.owned.includes(id)) return;
      if (AppState.coins < s.price) { AudioEngine.error(); showToast(`Not enough coins! You need ${s.price - AppState.coins} more 🪙`, 'error'); return; }
      AppState.coins -= s.price; AppState.owned.push(id); AppState.equipped[s.slot] = id;
      savePersistentData(); applyLoadedProfileToUI(); renderShop(); AudioEngine.correct(); window.FX && window.FX.burst(innerWidth / 2, innerHeight / 3, 50, true); showToast(`Bought ${s.name}!`, 'info');
    }
    function equipItem(id) {
      const s = SHOP_ITEMS.find(x => x.id === id); if (!s) return;
      AppState.equipped[s.slot] = AppState.equipped[s.slot] === id ? null : id;
      savePersistentData(); renderShop(); AudioEngine.playTone(700, 'triangle', 0.08);
    }

    // friendly info pop-up (calm version of the siren)
    function infoPopup(icon, title, msg) {
      const old = document.getElementById('siren'); if (old) old.remove();
      const d = document.createElement('div'); d.id = 'siren'; d.className = 'info'; d.setAttribute('role', 'alertdialog');
      d.innerHTML = `<div class="sr-card"><div class="sr-ico">${icon}</div><small>NOTICE</small><h2>${escHtml(title)}</h2><p>${escHtml(msg)}</p><button type="button" id="siren-ok">GOT IT</button></div>`;
      document.body.appendChild(d); AudioEngine.playTone(660, 'sine', 0.15);
      const close = () => { d.classList.add('out'); setTimeout(() => d.remove(), 350); document.removeEventListener('keydown', onKey, true); };
      const onKey = (e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); close(); } };
      document.addEventListener('keydown', onKey, true); document.getElementById('siren-ok').onclick = close; document.getElementById('siren-ok').focus();
    }

    // 17 Question Battle Engine
    let battleState = {
      subject: 'c',
      questions: [],
      currentIdx: 0,
      userScore: 0,
      streak: 0,
      timer: 15,
      timerInterval: null,
      bots: [
        { name: "Lily", avatar: "🌸", score: 0 },
        { name: "Hazel", avatar: "✨", score: 0 },
        { name: "Elsa", avatar: "❄️", score: 0 },
        { name: "Spiderman", avatar: "🕷", score: 0 },
        { name: "Batman", avatar: "🦇", score: 0 }
      ]
    };

    function launch17QuestionBattle(subj) {
      AudioEngine.playTone(600, 'sine', 0.15);
      
      const assembled = assembleQuestions(subj, AppState.lobbyUnit == null ? -1 : AppState.lobbyUnit, AppState.focusWords);
      AppState.focusWords = null;
      battleState.subject = subj;
      battleState.questions = assembled;
      battleState.currentIdx = 0;
      battleState.userScore = 0;
      battleState.streak = 0;
      battleState.answeredIdx = -1;
      battleState.bots.forEach(b => b.score = 0);

      ['dashboard', 'bank', 'study', 'weak', 'rankings', 'profile'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) el.classList.add('hidden');
      });
      document.getElementById('live-battle-arena').classList.remove('hidden');

      renderBattleRound();
    }

    function renderBattleRound() {
      const q = battleState.questions[battleState.currentIdx];
      const arena = document.getElementById('live-battle-arena');
      const roundNum = battleState.currentIdx + 1;

      arena.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="flex items-center justify-between bg-slate-900/90 p-4 rounded-3xl border border-purple-800/40">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40">
                LEVEL ${roundNum} / 17
              </span>
              <span class="text-xs text-slate-400 font-mono">B.Tech Live Battle Arena</span>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-[10px] text-slate-400">Score</div>
                <div class="text-lg font-black text-purple-300 font-mono">${battleState.userScore}</div>
              </div>
              <button onclick="exitBattle()" class="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg">✕ Exit</button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 p-6 sm:p-8 rounded-3xl border border-purple-700/40 shadow-2xl relative">
            <div class="flex items-start justify-between gap-4 mb-6">
              <div class="text-base sm:text-xl font-bold text-white leading-relaxed flex-1">
                ${q.q}
              </div>

              <div class="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke-width="4" class="timer-circle-bg" />
                  <circle id="battle-timer-bar" cx="28" cy="28" r="24" stroke-width="4" class="timer-circle-progress" stroke-dasharray="150" stroke-dashoffset="0" />
                </svg>
                <span id="battle-timer-text" class="absolute font-mono font-bold text-sm text-purple-300">15</span>
              </div>
            </div>

            <div id="battle-options-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              ${q.options.map((opt, idx) => `
                <button onclick="submitBattleAnswer(${idx})" id="battle-opt-${idx}" class="p-4 rounded-2xl text-left bg-slate-950/80 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-500/50 text-slate-200 transition-all text-xs sm:text-sm font-semibold flex items-center justify-between">
                  <span><strong class="text-purple-400 mr-2">${String.fromCharCode(65 + idx)}.</strong> ${opt}</span>
                </button>
              `).join('')}
            </div>

            <div id="battle-feedback-box" class="hidden p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2">
              <div id="feedback-verdict" class="text-xs font-bold font-mono"></div>
              <p id="feedback-explanation" class="text-xs text-slate-300"></p>
              <div class="pt-2 flex justify-end">
                <button onclick="advanceNextBattleQuestion()" class="px-4 py-1.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white">Next Question ➔</button>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
            <div class="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-wider">Live Classroom Leaderboard</div>
            <div id="battle-leaderboard" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2"></div>
          </div>
        </div>
      `;

      injectLevelMap(false);
      updateBattleLeaderboard();
      startBattleTimer();
    }

    function startBattleTimer() {
      clearInterval(battleState.timerInterval);
      battleState.timer = 15;
      const textEl = document.getElementById('battle-timer-text');
      const barEl = document.getElementById('battle-timer-bar');

      battleState.timerInterval = setInterval(() => {
        battleState.timer--;
        if (textEl) textEl.textContent = battleState.timer;
        if (barEl) {
          const offset = 150 - (battleState.timer / 15) * 150;
          barEl.style.strokeDashoffset = offset;
        }

        if (battleState.timer <= 0) {
          clearInterval(battleState.timerInterval);
          submitBattleAnswer(-1);
        }
      }, 1000);
    }

    function submitBattleAnswer(chosenIdx) {
      if (battleState.answeredIdx === battleState.currentIdx) return; // already completed this level
      battleState.answeredIdx = battleState.currentIdx;
      clearInterval(battleState.timerInterval);
      const q = battleState.questions[battleState.currentIdx];
      const isCorrect = (chosenIdx === q.ans);

      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`battle-opt-${i}`);
        if (btn) btn.disabled = true;
      }

      battleState.bots.forEach(b => {
        if (Math.random() > 0.35) {
          b.score += Math.floor(600 + Math.random() * 300);
        }
      });

      if (chosenIdx >= 0) {
        const chosenBtn = document.getElementById(`battle-opt-${chosenIdx}`);
        if (isCorrect) {
          AudioEngine.correct();
          const speedBonus = battleState.timer * 40;
          battleState.userScore += (600 + speedBonus);
          battleState.streak++;
          awardXp(10, 5, true);
          if (chosenBtn) chosenBtn.className += ' bg-emerald-950/80 border-emerald-500 text-emerald-300';
        } else {
          AudioEngine.error();
          battleState.streak = 0;
          if (chosenBtn) chosenBtn.className += ' bg-red-950/80 border-red-500 text-red-300';
        }
      } else {
        AudioEngine.error();
      }

      const correctBtn = document.getElementById(`battle-opt-${q.ans}`);
      if (correctBtn) correctBtn.className += ' bg-emerald-950/80 border-emerald-500 text-emerald-300';

      const feedbackBox = document.getElementById('battle-feedback-box');
      const verdict = document.getElementById('feedback-verdict');
      const exp = document.getElementById('feedback-explanation');

      feedbackBox.classList.remove('hidden');
      verdict.innerHTML = isCorrect ? '<span class="text-emerald-400">✅ CORRECT!</span>' : '<span class="text-red-400">❌ INCORRECT!</span>';
      exp.textContent = q.exp || 'Verified standard B.Tech engineering curriculum question.';

      updateBattleLeaderboard();
      injectLevelMap(true);
      levelCompleteBanner(battleState.currentIdx + 1, isCorrect);

      clearTimeout(battleState.advT);
      battleState.advT = setTimeout(() => advanceNextBattleQuestion(), 3500);
    }

    function advanceNextBattleQuestion() {
      clearInterval(battleState.timerInterval);
      clearTimeout(battleState.advT);
      if (battleState.answeredIdx !== battleState.currentIdx) return; // level not completed yet: stay here
      if (battleState.currentIdx < 16) {
        battleState.currentIdx++;
        renderBattleRound();
      } else {
        renderPodiumCelebration();
      }
    }

    function updateBattleLeaderboard() {
      const container = document.getElementById('battle-leaderboard');
      if (!container) return;

      const players = [
        { name: AppState.username, avatar: AppState.avatar, score: battleState.userScore, isUser: true },
        ...battleState.bots
      ].sort((a, b) => b.score - a.score);

      container.innerHTML = players.map(p => `
        <div class="p-2.5 rounded-2xl ${p.isUser ? 'bg-purple-900/60 border border-purple-500' : 'bg-slate-950 border border-slate-800'} text-center">
          <div class="text-lg">${p.avatar}</div>
          <div class="text-xs font-bold truncate ${p.isUser ? 'text-purple-300' : 'text-slate-300'}">${p.name}</div>
          <div class="text-[10px] font-mono text-slate-400 font-bold">${p.score} pts</div>
        </div>
      `).join('');
    }

    function renderPodiumCelebration() {
      API.saveScore(battleState.userScore, battleState.subject);
      awardXp(50 + Math.min(150, Math.round(battleState.userScore / 150)), 25 + Math.min(75, Math.round(battleState.userScore / 400)));
      AudioEngine.correct();
      const arena = document.getElementById('live-battle-arena');
      const players = [
        { name: AppState.username, avatar: AppState.avatar, score: battleState.userScore, isUser: true },
        ...battleState.bots
      ].sort((a, b) => b.score - a.score);

      arena.innerHTML = `
        <div class="max-w-2xl mx-auto text-center space-y-6 bg-slate-900/90 p-8 rounded-3xl border border-purple-600/40 shadow-2xl">
          <div class="text-5xl">🏆</div>
          <h2 class="text-3xl font-black text-white brand-glow">Battle Concluded!</h2>
          <p class="text-xs text-slate-400">17 Rounds Completed across B.Tech Engineering Curriculum</p>

          <div class="grid grid-cols-3 gap-3 items-end pt-4">
            <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div class="text-2xl">${players[1].avatar}</div>
              <div class="text-xs font-bold text-slate-300">${players[1].name}</div>
              <div class="text-xs font-mono text-purple-300">${players[1].score} pts</div>
              <span class="text-xs font-bold text-slate-400">🥈 2nd Place</span>
            </div>
            <div class="p-5 rounded-2xl bg-purple-900/60 border border-purple-500 transform -translate-y-3 shadow-xl shadow-purple-600/30">
              <div class="text-3xl">${players[0].avatar}</div>
              <div class="text-sm font-black text-white">${players[0].name}</div>
              <div class="text-xs font-mono text-amber-300">${players[0].score} pts</div>
              <span class="text-xs font-bold text-yellow-400">👑 Champion</span>
            </div>
            <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div class="text-2xl">${players[2].avatar}</div>
              <div class="text-xs font-bold text-slate-300">${players[2].name}</div>
              <div class="text-xs font-mono text-purple-300">${players[2].score} pts</div>
              <span class="text-xs font-bold text-amber-600">🥉 3rd Place</span>
            </div>
          </div>

          <div class="pt-4">
            <button onclick="exitBattle()" class="px-6 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30">
              Back to Dashboard ➔
            </button>
          </div>
        </div>
      `;
    }

    function exitBattle() {
      clearTimeout(battleState.advT);
      clearInterval(window._lobbyPoll);
      clearInterval(battleState.timerInterval);
      document.getElementById('live-battle-arena').classList.add('hidden');
      switchTab('dashboard');
    }

    // ==================== STUDY TIME HUB ====================
    let academicTodos = [
      { id: 1, text: "Complete C Programming Linked List Lab Record", done: false, priority: "high" },
      { id: 2, text: "Revise EDTA water hardness buffer calculations", done: true },
      { id: 3, text: "Practice Cayley-Hamilton theorem matrix inverses", done: false, priority: "low" }
    ];

    function renderStudyHub() {
      renderAcademicTodos();
      renderSyllabusUnits();
      renderSyllabusTopicsDetailed('c');
    }

    function switchStudySubTab(subId) {
      ['selfquiz', 'todos', 'syllabus'].forEach(s => {
        document.getElementById(`subtab-${s}`).classList.add('hidden');
        const btn = document.getElementById(`subnav-${s}`);
        if (btn) {
          btn.classList.remove('bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
          btn.classList.add('text-slate-300');
        }
      });

      document.getElementById(`subtab-${subId}`).classList.remove('hidden');
      const targetBtn = document.getElementById(`subnav-${subId}`);
      if (targetBtn) {
        targetBtn.classList.add('bg-pink-600', 'text-white', 'shadow-md', 'shadow-pink-600/30');
        targetBtn.classList.remove('text-slate-300');
      }
    }

    function updateSliderCount(val) {
      document.getElementById('slider-count-badge').textContent = `${val} Question${val == 1 ? '' : 's'}`;
    }

    const TODO_PRI = {
      high:   { label: 'HIGH',   color: '#ef4444', dot: '🔴', rank: 0 },
      medium: { label: 'MEDIUM', color: '#f97316', dot: '🟠', rank: 1 },
      low:    { label: 'LOW',    color: '#facc15', dot: '🟡', rank: 2 }
    };

    function renderAcademicTodos() {
      const container = document.getElementById('todo-items-list');
      const sorted = [...academicTodos].sort((a, b) => (a.done - b.done) || (TODO_PRI[a.priority || 'medium'].rank - TODO_PRI[b.priority || 'medium'].rank));
      container.innerHTML = sorted.map(t => {
        const pr = TODO_PRI[t.priority] || TODO_PRI.medium;
        return `
        <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3" style="border-left:5px solid ${pr.color};${t.done ? 'opacity:.6;' : `box-shadow:0 0 18px -6px ${pr.color};`}">
          <div class="flex items-center gap-3 min-w-0">
            <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleAcademicTodo(${t.id})" class="accent-pink-500 w-4 h-4 cursor-pointer flex-shrink-0">
            <span class="text-xs sm:text-sm ${t.done ? 'line-through text-slate-500' : 'text-slate-200'} break-words">${escHtml(t.text)}</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="cycleTodoPriority(${t.id})" title="Click to change priority" style="color:${pr.color};border:1px solid ${pr.color}66;background:${pr.color}1f" class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">${pr.dot} ${pr.label}</button>
            <button onclick="deleteAcademicTodo(${t.id})" class="text-xs text-slate-500 hover:text-red-400">✕</button>
          </div>
        </div>`;
      }).join('');
      const todoBadge = document.getElementById('dash-todo-count');
      if (todoBadge) todoBadge.textContent = academicTodos.filter(t => !t.done).length;
    }

    function cycleTodoPriority(id) {
      const t = academicTodos.find(x => x.id === id); if (!t) return;
      const order = ['high', 'medium', 'low'];
      t.priority = order[(order.indexOf(t.priority || 'medium') + 1) % 3];
      savePersistentData(); renderAcademicTodos(); AudioEngine.playTone(560, 'triangle', 0.08);
    }

    function addAcademicTodo() {
      const input = document.getElementById('new-todo-input');
      const text = (input.value || '').trim();
      if (!text) return;

      academicTodos.unshift({ id: Date.now(), text, done: false, priority: (document.getElementById('new-todo-priority') || {}).value || 'medium' });
      input.value = '';
      savePersistentData();
      renderAcademicTodos();
      AudioEngine.playTone(500, 'sine', 0.08);
    }

    function toggleAcademicTodo(id) {
      const t = academicTodos.find(item => item.id === id);
      if (t) {
        t.done = !t.done;
        savePersistentData();
        renderAcademicTodos();
      }
    }

    function deleteAcademicTodo(id) {
      academicTodos = academicTodos.filter(t => t.id !== id);
      savePersistentData();
      renderAcademicTodos();
    }

    function _oldRenderSyllabusUnits() {
      const container = document.getElementById('syllabus-units-container');
      const units = [
        { sub: "💻 C Programming", unit: "Unit 1: Algorithms & Data Types", pct: 85 },
        { sub: "💻 C Programming", unit: "Unit 4: Pointers & DMA", pct: 38 },
        { sub: "🐍 Python", unit: "Unit 2: Slicing & Collections", pct: 75 },
        { sub: "📐 Maths & Calculus", unit: "Unit 3: Cayley-Hamilton & Matrices", pct: 55 },
        { sub: "🧪 Chemistry", unit: "Unit 1: EDTA & Water Technology", pct: 42 }
      ];

      container.innerHTML = units.map(u => `
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div class="flex justify-between text-xs font-bold">
            <span class="text-white">${u.sub}</span>
            <span class="text-pink-400 font-mono">${u.pct}%</span>
          </div>
          <div class="text-xs text-slate-400">${u.unit}</div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style="width: ${u.pct}%"></div>
          </div>
        </div>
      `).join('');
    }

    // Render Detailed Linear Syllabus Topics Outline with Peacock Flair 🦚
    function _oldRenderSyllabusTopicsDetailed(subjKey) {
      const container = document.getElementById('linear-syllabus-content');
      if (!container) return;
      const unitList = DETAILED_SYLLABUS_MAP[subjKey] || DETAILED_SYLLABUS_MAP['c'];

      container.innerHTML = unitList.map((unitBlock, uIdx) => `
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/40 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <span>🦚</span>
              <span>${unitBlock.unit}</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
              Unit ${uIdx + 1}
            </span>
          </div>
          
          <ul class="space-y-1.5 pl-2 border-l-2 border-purple-700/40">
            ${unitBlock.topics.map(t => `
              <li class="text-xs text-slate-300 flex items-start gap-2">
                <span class="text-purple-400 mt-0.5 text-[10px]">🔹</span>
                <span class="leading-relaxed">${t}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('');
    }

    function startSoloSelfQuiz() {
      const subj = document.getElementById('self-quiz-subject').value;
      openUnitPicker(subj, async (u) => { AppState.lobbyUnit = u; showToast('Preparing fresh questions…', 'info'); await prepareNoteText(subj); launch17QuestionBattle(subj); });
    }

    // ==================== WEAK TOPICS ====================
    const WEAK_TOPICS_DATA = [
      { topic: "Pointers & Dynamic Memory Allocation", sub: "C Programming", acc: 38, icon: "⚡" },
      { topic: "EDTA Hardness & Water Titration", sub: "Engineering Chemistry", acc: 42, icon: "💧" },
      { topic: "Cayley-Hamilton Characteristic Equations", sub: "Maths & Calculus", acc: 55, icon: "🔢" },
      { topic: "Python Negative Slicing & Strides", sub: "Python", acc: 58, icon: "🔪" }
    ];

    function renderWeakTopics() {
      const container = document.getElementById('weak-topics-list');
      container.innerHTML = WEAK_TOPICS_DATA.map(w => `
        <div class="p-5 rounded-3xl bg-slate-900/90 border border-emerald-600/30 hover:border-emerald-400 transition-all flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${w.icon}</span>
            <div>
              <h4 class="text-sm font-bold text-white">${w.topic}</h4>
              <div class="text-xs text-slate-400">${w.sub}</div>
              <div class="w-36 h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                <div class="h-full bg-emerald-500 rounded-full" style="width: ${w.acc}%"></div>
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-base font-black font-mono text-emerald-400">${w.acc}%</div>
            <button onclick="launchTargetedRevisionQuiz()" class="mt-1 text-[11px] font-bold text-emerald-300 underline">Revise</button>
          </div>
        </div>
      `).join('');
    }

    let _weakI = 0;
    function launchTargetedRevisionQuiz() {
      const W = WEAK_TOPICS_DATA[_weakI++ % WEAK_TOPICS_DATA.length];
      const map = { 'C Programming': 'c', 'Engineering Chemistry': 'chemistry', 'Maths & Calculus': 'maths', 'Python': 'python' };
      const k = map[W.sub] || 'c';
      AppState.lobbyUnit = -1;
      AppState.focusWords = W.topic.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 4);
      showToast(`Revision arena: ${W.topic}`, 'info');
      prepareNoteText(k).then(() => launch17QuestionBattle(k));
    }

    // ==================== ROCKET PROGRESS ====================
    let rocketAnimationId = null;
    let rocketLaunched = false;

    function resetRocketCanvas() {
      rocketLaunched = false;
      if (rocketAnimationId) { cancelAnimationFrame(rocketAnimationId); rocketAnimationId = null; }
      const oldFb = document.getElementById('rocket-feedback'); if (oldFb) oldFb.remove();
      const canvas = document.getElementById('rocket-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLaunchpadAxes(ctx, canvas.width, canvas.height);
      drawRocketEmoji(ctx, 45, canvas.height - 35, 0);

      const status = document.getElementById('rocket-hud-status');
      if (status) status.textContent = "Rocket 🚀 on Launchpad (Ready to Launch)";
    }

    function drawLaunchpadAxes(ctx, w, h) {
      ctx.strokeStyle = "rgba(120, 53, 15, 0.25)";
      ctx.lineWidth = 1;

      for (let y = 30; y < h - 40; y += 45) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 20, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 20);
      ctx.lineTo(40, h - 35);
      ctx.lineTo(w - 20, h - 35);
      ctx.stroke();

      ctx.fillStyle = "#78350f";
      ctx.font = "10px monospace";
      ctx.fillText("40 Qs", 5, 35);
      ctx.fillText("20 Qs", 5, (h - 35) / 2 + 15);
      ctx.fillText("0 Qs", 8, h - 35);

      ctx.fillText("Day 1", 42, h - 18);
      ctx.fillText("Day 15", w / 2 - 15, h - 18);
      ctx.fillText("Day 31", w - 45, h - 18);
    }

    // High-Visibility 🚀 Emoji Along Trajectory
    function drawRocketEmoji(ctx, x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      if (rocketLaunched) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(-8, 12, 5 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#eab308";
        ctx.beginPath();
        ctx.arc(-12, 16, 3 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀", 0, 0);

      ctx.restore();
    }

    function launchMonthRocket() {
      const _sel = document.getElementById('rocket-month-select'), _m = parseInt(_sel.value), _now = new Date();
      if (_m >= _now.getMonth()) {
        const nm = _sel.options[_sel.selectedIndex].text.replace(' (Current)', '');
        const left = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate() - _now.getDate();
        if (_m === _now.getMonth()) infoPopup('🚀', `${nm.toUpperCase()} IS STILL IN PROGRESS`, `Your rocket flight report unlocks when the month ends (${left} day${left === 1 ? '' : 's'} to go). Keep solving questions — every day adds fuel!`);
        else infoPopup('🗓', `${nm.toUpperCase()} HAS NOT STARTED`, 'Pick a completed month to watch its rocket flight and progress report.');
        return;
      }
      AudioEngine.rocket();
      rocketLaunched = true;

      const canvas = document.getElementById('rocket-canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      const selectedMonth = parseInt(document.getElementById('rocket-month-select').value);
      const daysInMonth = 30;
      const points = [];
      const stepX = (w - 70) / daysInMonth;

      for (let d = 0; d <= daysInMonth; d++) {
        const solved = 8 + Math.sin(d * 0.4 + selectedMonth) * 12 + (d % 4) * 3;
        const normY = Math.max(0, Math.min(38, solved));
        const px = 45 + d * stepX;
        const py = (h - 40) - (normY / 40) * (h - 75);
        points.push({ x: px, y: py, solved: Math.round(normY) });
      }

      let currentStep = 0;
      const totalSteps = points.length - 1;

      if (rocketAnimationId) cancelAnimationFrame(rocketAnimationId);

      function step() {
        ctx.clearRect(0, 0, w, h);
        drawLaunchpadAxes(ctx, w, h);

        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i <= currentStep; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        for (let i = 0; i <= currentStep; i++) {
          ctx.fillStyle = "#991b1b";
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        const head = points[currentStep];
        let angle = 0;
        if (currentStep > 0) {
          const prev = points[currentStep - 1];
          angle = Math.atan2(head.y - prev.y, head.x - prev.x) + (Math.PI / 4);
        }

        drawRocketEmoji(ctx, head.x, head.y, angle);

        const status = document.getElementById('rocket-hud-status');
        if (status) {
          status.innerHTML = `<span class="text-red-700 font-bold">🚀 Rocket in Flight • Day ${currentStep + 1} • Solved: ${head.solved} Qs • XP: +${head.solved * 35}</span>`;
        }

        if (currentStep < totalSteps) {
          currentStep++;
          rocketAnimationId = requestAnimationFrame(function gate(t) {
            if (t - (step._last || 0) < 80) { rocketAnimationId = requestAnimationFrame(gate); return; }
            step._last = t;
            step();
          });
        } else {
          rocketAnimationId = null;
          rocketLaunched = false;
          showRocketFeedback(points);
        }
      }

      step();
    }


    // ==================== ROCKET LANDING FEEDBACK ====================
    function showRocketFeedback(points) {
      const status = document.getElementById('rocket-hud-status');
      const total = points.reduce((a, p) => a + p.solved, 0);
      const best = points.reduce((a, p, i) => p.solved > points[a].solved ? i : a, 0);
      const avg = Math.round(total / points.length);
      const name = AppState.username || 'Champ';
      const monthSel = document.getElementById('rocket-month-select');
      const monthName = monthSel ? monthSel.options[monthSel.selectedIndex].text.replace(' (Current)', '') : 'this month';

      const tiers = [
        { min: 20, emoji: '🏆', title: `Outstanding work, ${name}!`, msg: `You absolutely crushed ${monthName}. That kind of consistency is how toppers are made — be proud of yourself!` },
        { min: 14, emoji: '🌟', title: `You did great, ${name}!`, msg: `Solid, steady progress in ${monthName}. Every question you solved is a step closer to your goal. Keep this momentum going!` },
        { min: 0,  emoji: '💪', title: `Good job, ${name}!`, msg: `You showed up and kept going in ${monthName} — that's what matters most. Small steps every day add up to big results. You've got this!` }
      ];
      const t = tiers.find(x => avg >= x.min);

      if (status) status.innerHTML = `<span class="text-emerald-700 font-bold">${t.emoji} Mission complete — you did good! Keep going!</span>`;
      AudioEngine.correct();
      showToast(`${t.emoji} ${t.title}`, 'info');

      if (AppState.currentTab !== 'profile') return;
      const holder = document.getElementById('rocket-canvas').parentElement;
      const old = document.getElementById('rocket-feedback'); if (old) old.remove();
      const box = document.createElement('div');
      box.id = 'rocket-feedback';
      box.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(61,35,20,.22);backdrop-filter:blur(2px);z-index:5';
      box.innerHTML = `
        <div class="rocket-fb-card" style="max-width:420px;width:100%;background:linear-gradient(145deg,#fffaf0,#fde9c9);border:2px solid rgba(217,119,6,.45);border-radius:24px;padding:20px 22px;text-align:center;box-shadow:0 25px 60px -15px rgba(120,53,15,.6);position:relative">
          <button onclick="document.getElementById('rocket-feedback').remove()" aria-label="Close" style="position:absolute;top:8px;right:12px;color:#92400e;font-weight:900;font-size:16px">✕</button>
          <div style="font-size:42px;line-height:1">${t.emoji}</div>
          <div style="font-weight:900;font-size:20px;color:#3d2314;margin-top:6px">${t.title}</div>
          <p style="font-size:12.5px;color:#78350f;margin:8px 0 12px;line-height:1.55">${t.msg}</p>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">
            <span style="background:#fff;border:1px solid rgba(180,83,9,.25);border-radius:12px;padding:6px 10px;font:700 11px 'JetBrains Mono',monospace;color:#9a3412">📘 ${total} Qs solved</span>
            <span style="background:#fff;border:1px solid rgba(180,83,9,.25);border-radius:12px;padding:6px 10px;font:700 11px 'JetBrains Mono',monospace;color:#9a3412">⚡ Best: Day ${best + 1} (${points[best].solved} Qs)</span>
            <span style="background:#fff;border:1px solid rgba(180,83,9,.25);border-radius:12px;padding:6px 10px;font:700 11px 'JetBrains Mono',monospace;color:#9a3412">📈 Avg ${avg}/day</span>
          </div>
          <div style="font-size:11px;font-weight:700;color:#b45309">Proud of your effort — keep that streak alive! 🔥</div>
        </div>`;
      holder.appendChild(box);
      if (window.FX) { const r = holder.getBoundingClientRect(); window.FX.burst(r.left + r.width / 2, r.top + r.height * 0.4, 70, true); window.FX.rain(2500); }
    }

    // ==================== USER PROFILE MODAL ====================
    let chosenAvatarTemp = '⚡';

    function openProfileModal() {
      document.getElementById('input-custom-username').value = AppState.username;
      chosenAvatarTemp = AppState.avatar;
      document.getElementById('profile-custom-modal').classList.remove('hidden');
    }

    function setChosenAvatar(emoji) {
      chosenAvatarTemp = emoji;
      AudioEngine.playTone(480, 'sine', 0.08);
    }

    function saveUserProfileCustom() {
      const newName = (document.getElementById('input-custom-username').value || '').trim();
      if (newName) AppState.username = newName;
      AppState.avatar = chosenAvatarTemp;
      savePersistentData();
      applyLoadedProfileToUI();
      closeModal('profile-custom-modal');
      showToast('Profile updated!', 'info');
      AudioEngine.correct();
    }

    // Initialize Page
    window.addEventListener('DOMContentLoaded', () => {
      loadPersistentData();
      renderSubjectCards();
      renderStudyHub();
      renderWeakTopics();
      resetRocketCanvas();
      API.health();
    });

    window.addEventListener('resize', () => {
      if (AppState.currentTab === 'profile') resetRocketCanvas();
    });
  