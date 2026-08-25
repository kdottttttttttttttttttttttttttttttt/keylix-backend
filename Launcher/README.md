# Keylix Launcher (Retrac-style)

Electron launcher for Project Keylix C2S2.

## Features like Retrac
- Login (username) + backend switch
- Download builds with progress bar (host zip on any CDN)
- Auto-extract + locate existing folder
- Play button launches `FortniteClient-Win64-Shipping.exe` with auth args
- Starfall.dll injection if present

## Setup
```bat
cd Launcher
npm install
npm start
```

## Hosting builds
1. Zip your 12.41 build: `Fortnite/` folder containing `FortniteGame/Binaries/Win64/FortniteClient-Win64-Shipping.exe`
2. Include `Starfall.dll` (built from PuppeOGFN/Starfall with Backend=http://YOUR_IP:3551) in Win64
3. Upload zip to S3 / Google Drive direct link / Mega / file hosting
4. In launcher Settings -> Build Download URL paste direct link (e.g. https://cdn.keylix.com/12.41.zip)
5. Users click Download in launcher -> auto downloads + extracts

Alternatively users can just drop existing 12.41 folder and Browse to it.

## Build .exe
```bat
npm run build
# output in dist/
```

## Backend manifest
Backend serves `GET /keylix/api/launcher/manifest` - launcher can fetch available builds from there instead of hardcoded.
