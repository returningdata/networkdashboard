# Sector Panel (Full MVP)

This build includes:
- Server linking via `/authorize` (one-time code)
- Discord OAuth login: identify + guilds + guilds.join
- Network Roles:
  - create network role
  - map role -> discord role per server
  - mark required servers per role
  - grant/revoke roles by Discord user ID
- Sync:
  - enqueues SyncAction rows (ADD_ROLE/REMOVE_ROLE) for your bot to execute
- Members:
  - shows network staff (dashboard access)
  - shows role grants

## Deploy
- Push `sector-panel/` to GitHub and import into Vercel
- Use hosted Postgres (Neon/Supabase)
- Add env vars from `.env.example`

## Discord settings
Redirect URLs:
- http://localhost:3000/api/auth/callback/discord
- https://YOUR_DOMAIN/api/auth/callback/discord

Scopes:
- identify, guilds, guilds.join
