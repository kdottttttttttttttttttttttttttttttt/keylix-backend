# Project Keylix

Custom Fortnite Backend - clean, Helix/Starfall/Reboot inspired.

> **Educational purpose only.** You must own a legitimate copy of Fortnite. This does not include any Epic assets.

### Features
- Auth (oauth/token, verify) with JWT
- Profiles `athena` + `common_core` (99999 V-Bucks, level 100)
- Storefront v2 (configurable via `config.json`)
- Timeline / Lightswitch / Cloudstorage / Friends / Party (stubbed UP)
- MCP commands (QueryProfile, ClientQuestLogin, SetMtxPlatform etc.)
- Content pages / Battle Pass stub
- Matchmaking + WebSocket Matchmaker (port 3552)

### Stack
Based on `PuppeOGFN/Helix-backend` + `PuppeOGFN/Starfall` concepts, rewritten clean in Express.

### Setup

```bat
npm install
npm start
:: in another terminal
node Matchmaker/matchmaker.js
```

Backend runs on `http://127.0.0.1:3551` (see `config.json` / `.env`)

### Connecting Fortnite

1. Use SSL bypass:
   - **Starfall**: edit `Starfall/opts.h` -> `Backend = "http://127.0.0.1:3551"`
   - **Tellurium** (Starfall successor): same
   - Or Fiddler/hosts redirect

2. Use a launcher:
   - `PuppeOGFN/Launcher` or `Auties00/Reboot-Launcher` - set backend URL to your IP

3. Optional: Arena paks - drop your `arena-paks` folder into Fortnite to enable Arena playlists (if `config.features.arena=true`)

### Config
Edit `config.json`:
```json
{
  "season": 12,
  "version": "12.41",
  "shop": { "items": [...] }
}
```

### Project Structure
```
Project Keylix/
 ├── src/index.js          # entry
 ├── src/routes/           # auth, fortnite, matchmaker, other
 ├── src/utils/            # tokens, profile
 ├── Matchmaker/           # WS matchmaker
 └── config.json
```

### Next Steps
- Add MongoDB (replace Map stores)
- Add real BattlePass + challenges
- Add XMPP for friends/party
- Add dedicated server integration for BattleRoyale match

Need a specific Season (e.g. Chapter 2 Season 2 or OG)? Tell me and I'll swap the timeline/content accordingly.
