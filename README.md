# StudyWarz — Full Stack

```
studywarzzz/
├── frontend/                 # what the user sees
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── fx.js
├── backend/                  # Node.js + Express API
│   ├── server.js
│   ├── route-auth.js
│   ├── route-profile.js
│   ├── route-rooms.js
│   ├── route-scores.js
│   ├── route-notes.js
│   ├── middleware-auth.js
│   ├── errorHandler.js
│   └── helpers.js
├── database/                 # Supabase
│   ├── db.js                 # all database functions
│   └── schema.sql            # run once in Supabase SQL Editor
├── package.json
├── .env.example
└── .gitignore
```

## Setup (5 minutes)
1. Create a free project at https://supabase.com
2. Supabase → **SQL Editor** → paste all of `database/schema.sql` → **Run** (safe to run again after updates)
3. Supabase → **Project Settings → API** → copy the **Project URL** and the **service_role** key (NOT the anon key)
4. In the project folder:
   ```
   copy .env.example .env      (Mac/Linux: cp .env.example .env)   → paste URL + key into .env
   npm install
   npm start
   ```
5. Wait for `✅ Supabase connected` in the terminal, then open **http://localhost:3000**

The small pill at the top-right of the login screen shows live status:
`● server + Supabase connected` (green) or the exact problem (red).

## Troubleshooting
| What you see | Cause | Fix |
|---|---|---|
| Red pill "server not reachable" | `npm start` not running, or terminal closed | run `npm start`, keep the terminal open |
| Red pill "Supabase problem: tables not found" | schema not run | run `database/schema.sql` in Supabase SQL Editor |
| "Supabase rejected the key" | wrong key | use the **service_role** key in `.env`, no quotes |
| "Cannot reach Supabase" | wrong `SUPABASE_URL` | Project URL only, like `https://abcd.supabase.co` |
| "Port 3000 already in use" | old server still running | close it, or set `PORT=3001` in `.env` |

Test the API directly: http://localhost:3000/api/health

## Deploying online (Render / Railway)
Build command `npm install`, start command `npm start`, add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SESSION_SECRET` as environment variables. The frontend is served by the same server, so nothing else to configure. If you host the frontend separately, set `DEPLOYED_API` in `frontend/config.js`.

## Notes on accounts
- Passwords are stored as salted scrypt hashes. Usernames are not case-sensitive.
- XP, coins, to-dos and syllabus ticks are saved per account in Supabase `profiles`.
- Uploaded notes are private to the account that uploaded them (files in Supabase Storage bucket `notes`).
- Never put the `service_role` key in the frontend or commit `.env`.
