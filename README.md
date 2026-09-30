# PollPop

リアルタイム5択投票 SaaS（Free版 MVP）

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL + anon key
```

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Realtime for `polls` / `votes` (schema already adds them to the publication)
4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Routes

| Path | Description |
|------|-------------|
| `/` | Create poll (guest, 1 active poll) |
| `/poll/[id]` | Voter UI + combo |
| `/poll/[id]/admin` | QR / share / live chart / close |
| `/poll/[id]/obs` | Transparent Animal Race for OBS |
