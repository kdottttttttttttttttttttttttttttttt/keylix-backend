const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Global error handling - prevent 500s from leaking stack
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// In-memory stores (replace with MongoDB in prod)
global.profiles = new Map();
global.tokens = new Map();

// Auto-load routes
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  const route = require(path.join(routesPath, file));
  app.use('/', route);
  console.log(`[Keylix] Loaded route: ${file}`);
});

// Health
app.get('/', (req, res) => {
  res.json({ 
    name: "Project Keylix", 
    status: "online", 
    version: config.raw.version,
    season: config.raw.season,
    endpoints: ["/account/api/*", "/fortnite/api/*", "/lightswitch/api/*", "/waitingroom/api/*"]
  });
});

// 404 fallback - NEVER return 404 for login-critical paths or game will abort login (CheckPlatformPlayAllowed)
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url} -> returning 200 (login safe)`);
  // Critical login endpoints must return correct shape, not 404
  if (req.url.includes('canPlay') || req.url.includes('CanPlay') || req.url.includes('tryPlayOnPlatform')) {
    return res.json({ canPlay: true, canPlayOnPlatform: true, users: [], avatarInfos: [] });
  }
  if (req.url.includes('externalAuths')) return res.json([]);
  if (req.url.includes('avatar')) return res.json({ avatarInfos: [] });
  if (req.url.includes('platform')) return res.json({ canPlay: true, users: [], avatarInfos: [] });
  if (req.url.includes('allowed')) return res.json({ canPlay: true, users: [], avatarInfos: [] });
  // Generic success - don't kill login
  res.json({});
});

const http = require('http');
const server = http.createServer(app);

// Integrated Matchmaker WS on same port (for Render single-port)
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server, path: '/ws' });
const wss2 = new WebSocket.Server({ noServer: true }); // for matchmaker compatibility

wss.on('connection', (ws) => {
  console.log('[Matchmaker] WS connected on /ws');
  ws.send(JSON.stringify({ name: "Connected", payload: {} }));
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.name === "Join" || data.state === "Waiting") {
        setTimeout(() => ws.send(JSON.stringify({ name: "Play", payload: { matchId: require('uuid').v4(), sessionId: require('uuid').v4(), joinDelaySec: 1 } })), 1000);
      }
    } catch { ws.send(JSON.stringify({ name: "Play", payload: {} })); }
  });
  setTimeout(() => { if(ws.readyState===1) ws.send(JSON.stringify({ name:"Play", payload:{ matchId:"keylix-"+Date.now(), sessionId: require('uuid').v4() } })); }, 2000);
});

// Keep old Matchmaker file working locally if run separately
server.on('upgrade', (req, socket, head) => {
  if (req.url.includes('/ws') || req.url.includes('matchmaker')) {
    wss2.handleUpgrade(req, socket, head, ws => wss2.emit('connection', ws, req));
  }
});

server.listen(config.port, () => {
  console.log(`
  ██╗  ██╗███████╗██╗   ██╗██╗     ██╗██╗  ██╗
  ██║ ██╔╝██╔════╝╚██╗ ██╔╝██║     ██║╚██╗██╔╝
  █████╔╝ █████╗   ╚████╔╝ ██║     ██║ ╚███╔╝ 
  ██╔═██╗ ██╔══╝    ╚██╔╝  ██║     ██║ ██╔██╗ 
  ██║  ██╗███████╗   ██║   ███████╗██║██╔╝ ██╗
  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝╚═╝  ╚═╝
  Project Keylix v1.0.0 | ${config.raw.displaySeason} ${config.raw.theme} | Season ${config.raw.season} (${config.raw.version})
  Backend: ${config.backendUrl}
  Port: ${config.port} (HTTP + WS /ws)
  `);
});
