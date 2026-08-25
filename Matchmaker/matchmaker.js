// Simple WebSocket Matchmaker for Keylix (port 3552)
// Fortnite expects MMS to run on separate port - this is a minimal version
const WebSocket = require('ws');
const config = require('../src/config');
const port = config.raw.matchmakerPort || 3552;

const wss = new WebSocket.Server({ port }, () => {
  console.log(`[Keylix Matchmaker] Listening on port ${port}`);
});

wss.on('connection', (ws) => {
  console.log('[Matchmaker] New connection');
  
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('[Matchmaker] Received:', data);

      // Immediately send Play message - instant ready
      if (data.name === "Join" || data.state === "Waiting") {
        setTimeout(() => {
          ws.send(JSON.stringify({
            name: "Play",
            payload: {
              matchId: require('uuid').v4(),
              sessionId: require('uuid').v4(),
              joinDelaySec: 1
            }
          }));
        }, 1000);
      }
    } catch(e) {
      // plain text payloads
      ws.send(JSON.stringify({ name: "Play", payload: {} }));
    }
  });

  // Send initial Connected
  ws.send(JSON.stringify({ name: "Connected", payload: {} }));
  
  // Auto-play after 2s even without Join (for testing)
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        name: "Play",
        payload: {
          matchId: "keylix-" + Date.now(),
          sessionId: require('uuid').v4()
        }
      }));
    }
  }, 2000);
});

module.exports = wss;
