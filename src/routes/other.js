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
// Fix CheckPlatformPlayAllowed - must return true as top-level boolean for 12.41, but also handle users/avatarInfos via separate endpoints
router.post('/fortnite/api/game/v2/tryPlayOnPlatform/account/:accountId', (req,res)=>{
  console.log(`[tryPlay] ${req.params.accountId} platform=${req.query.platform} -> allowed`);
  res.json(true);
});
router.get('/fortnite/api/game/v2/tryPlayOnPlatform/account/:accountId', (req,res)=>res.json(true));
router.all('/fortnite/api/game/v2/tryPlayOnPlatform/*', (req,res)=>res.json(true));
// Keep old canPlay for other versions
router.get('/account/api/public/account/:accountId/canPlay', (req,res)=>res.json({ canPlay: true, canPlayOnPlatform: true }));
router.all('/account/api/public/account/:accountId/canPlay/*', (req,res)=>res.json({ canPlay: true, canPlayOnPlatform: true }));
router.get('/account/api/public/account/:accountId/externalAuths', (req,res)=>res.json([]));
router.get('/account/api/public/account/:accountId/externalAuths/*', (req,res)=>res.json([]));
router.all('/api/public/account/:accountId/externalAuths*', (req,res)=>res.json([]));
router.get('/fortnite/api/game/v2/avatar/*', (req,res)=>res.json({})); 
router.post('/fortnite/api/game/v2/avatar/*', (req,res)=>res.json({}));
router.all('/fortnite/api/game/v2/checkPlatform/*', (req,res)=>res.json({ canPlay: true }));
router.all('/account/api/platform/*', (req,res)=>res.json({ canPlay: true }));
// Fix users array type
router.get('/socialban/api/public/v1/*', (req, res) => res.json({ bans: [], warnings: [], users: [] }));
router.get('/presence/api/v1/*', (req,res)=>res.json({}));

router.get('/launcher/api/public/distributionPoints*', (req, res) => res.json({ distributions: ["https://download.epicgames.com/"] }));

// Keylix Launcher API - Retrac-style
router.get('/keylix/api/launcher/manifest', (req, res) => {
  const cfg = require('../../config.json');
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
        downloadUrl: cfg.hostedBuildUrl || "https://cdn.cbn.lol/12.41",
        downloadMirrors: ["https://cdn.cbn.lol/12.41","https://public.simplyblk.xyz/Fortnite%2012.41.zip","https://fnbuilds.boostedv2.dev/12.41.rar"],
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
