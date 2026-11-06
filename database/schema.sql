-- Run this once in Supabase → SQL Editor
create table if not exists rooms (
  code text primary key,
  subject text not null default 'c',
  host text not null,
  created_at timestamptz default now()
);
create table if not exists room_players (
  id bigint generated always as identity primary key,
  code text references rooms(code) on delete cascade,
  username text not null,
  avatar text default '⚡',
  joined_at timestamptz default now(),
  unique (code, username)
);
create table if not exists scores (
  id bigint generated always as identity primary key,
  username text not null,
  avatar text default '⚡',
  score int not null,
  subject text,
  created_at timestamptz default now()
);
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  title text not null,
  mime text,
  size text,
  path text not null,
  created_at timestamptz default now()
);
create table if not exists users (
  username text primary key,
  salt text not null,
  hash text not null,
  created_at timestamptz default now()
);
alter table users enable row level security;
create table if not exists profiles (
  username text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
-- private storage bucket for uploaded notes
insert into storage.buckets (id, name, public) values ('notes', 'notes', false) on conflict (id) do nothing;
-- the server uses the service-role key, so lock the tables from public access
alter table rooms enable row level security;
alter table room_players enable row level security;
alter table scores enable row level security;
alter table notes enable row level security;
-- one account per username (not case-sensitive): Ben@2026 and ben@2026 are the same
create unique index if not exists users_username_lower_idx on users (lower(username));

-- notes belong to the user who uploaded them (safe to run again)
alter table notes add column if not exists owner text;
create index if not exists notes_owner_idx on notes (owner);
create index if not exists scores_score_idx on scores (score desc);
