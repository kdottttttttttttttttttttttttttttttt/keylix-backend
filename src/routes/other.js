const express = require('express');
const router = express.Router();

router.post('/datarouter/api/v1/public/data', (req, res) => res.status(204).end());
router.post('/telemetry/*', (req, res) => res.status(204).end());
router.get('/socialban/api/public/v1/*', (req, res) => res.json({ bans: [], warnings: [] }));
router.get('/affiliate/api/public/affiliates/slug/*', (req, res) => res.json({ id: "keylix", slug: "keylix" }));
router.get('/fortnite/api/receipts/v1/account/:accountId/receipts', (req, res) => res.json([]));
router.post('/fortnite/api/game/v2/grant_access/*', (req, res) => res.status(204).end());
router.get('/fortnite/api/statsv2/account/:accountId', (req, res) => res.json({ startTime: 0, endTime: 0, stats: {}, accountId: req.params.accountId }));
router.get('/statsproxy/api/statsv2/account/:accountId', (req, res) => res.json({ startTime: 0, endTime: 0, stats: {} }));
router.get('/fortnite/api/stats/accountId/:accountId/bulk/window/*', (req, res) => res.json({}));
router.post('/fortnite/api/feedback/*', (req, res) => res.status(204).end());

router.get('/launcher/api/public/distributionPoints*', (req, res) => res.json({ distributions: ["https://download.epicgames.com/"] }));

// Keylix Launcher API - Retrac-style
router.get('/keylix/api/launcher/manifest', (req, res) => {
  res.json({
    project: "Keylix",
    season: "Chapter 2 Season 2",
    version: "12.41",
    builds: [
      {
        id: "12.41",
        name: "Chapter 2 Season 2 (12.41) - Top Secret",
        description: "Full C2S2 build - Midas, Spy Games. Requires ~20GB",
        size: "20GB",
        // HOST YOUR FILES HERE - set to your CDN / file host
        // Example: upload 12.41 zip to Google Drive / Mega / S3 and put link here
        downloadUrl: "https://example.com/keylix/12.41.zip",
        manifestUrl: "https://example.com/keylix/12.41.manifest.json",
        version: "12.41",
        injectedDll: "Starfall.dll"
      }
    ],
    news: [
      { title: "TOP SECRET", body: "C2S2 is live! Ghost vs Shadow." },
      { title: "Launcher v1.0", body: "Download builds directly in launcher like Retrac." }
    ],
    backendUrl: require('../../config.json').backendUrl
  });
});

router.get('/keylix/api/launcher/status', (req, res) => {
  res.json({ status: "online", playersOnline: global.profiles ? global.profiles.size : 0, version: require('../../config.json').version });
});

module.exports = router;
