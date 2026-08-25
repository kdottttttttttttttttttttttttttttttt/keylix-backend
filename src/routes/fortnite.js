const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/tokens');
const { getProfile } = require('../utils/profile');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

// Lightswitch - tells game if service is up - C2S2
router.get('/lightswitch/api/service/bulk/status', (req, res) => {
  res.json([{
    serviceInstanceId: "fortnite",
    status: "UP",
    message: "Keylix C2S2 Top Secret is UP!",
    maintenanceUri: null,
    overrideCatalogIds: ["a7f138b2-7837-451c-8610-93a00656945d"],
    allowedActions: ["PLAY", "DOWNLOAD"],
    banned: false,
    launcherInfoDTO: {
      appName: "Fortnite",
      catalogItemId: "4fe75bbc5a674f4f9b3566b5c90567da",
      namespace: "fn"
    }
  }]);
});

router.get('/lightswitch/api/service/fortnite/status', (req, res) => {
  res.json({
    serviceInstanceId: "fortnite",
    status: "UP",
    message: "Keylix C2S2 Online",
    maintenanceUri: null,
    allowedActions: [],
    banned: false
  });
});

// Waiting room
router.get('/waitingroom/api/waitingroom', (req, res) => res.status(204).end());

// Version check
router.get('/fortnite/api/v2/versioncheck/:platform', (req, res) => {
  res.json({ type: "NO_UPDATE" });
});
router.get('/fortnite/api/versioncheck', (req, res) => res.json({ type: "NO_UPDATE" }));

// Cloudstorage - returns empty for now
router.get('/fortnite/api/cloudstorage/system', (req, res) => res.json([]));
router.get('/fortnite/api/cloudstorage/user/:accountId', (req, res) => res.json([]));
router.put('/fortnite/api/cloudstorage/user/:accountId/*', (req, res) => res.status(204).end());

// Storefront
router.get('/fortnite/api/storefront/v2/catalog', (req, res) => {
  res.json({
    refreshIntervalHrs: 24,
    dailyPurchaseHrs: 24,
    expiration: new Date(Date.now() + 24*60*60*1000).toISOString(),
    storefronts: [
      {
        name: "BRDailyStorefront",
        catalogEntries: config.raw.shop.items.map(item => ({
          offerId: item.id,
          offerType: "StaticPrice",
          devName: item.id,
          title: item.id,
          description: "Keylix Item",
          categories: ["Panel 01"],
          dailyLimit: -1,
          weeklyLimit: -1,
          monthlyLimit: -1,
          prices: [{ currencyType: "MtxCurrency", currencySubType: "", regularPrice: item.price, finalPrice: item.price, saleExpiration: new Date(Date.now() + 86400000).toISOString(), basePrice: item.price }],
          matchFilter: "",
          filterWeight: 0,
          appStoreId: [],
          requirements: [],
          metaInfo: [],
          catalogGroup: "",
          catalogGroupPriority: 0,
          sortPriority: 0,
          title2: item.id,
          giftInfo: { bIsEnabled: false, forcedGiftBoxTemplateId: "", purchaseRequirements: [], giftRecordIds: [] },
          refundable: false,
          meta: { SectionId: "Featured", TileSize: "Small" },
          displayAssetPath: "",
          itemGrants: [{ templateId: item.id.includes(":") ? item.id : `AthenaCharacter:${item.id}`, quantity: 1 }]
        }))
      },
      { name: "BRWeeklyStorefront", catalogEntries: [] }
    ]
  });
});

router.get('/catalog/api/shared/bulk/offers', (req, res) => res.json({}));
router.get('/fortnite/api/storefront/v2/keychain', (req, res) => res.json([]));

// MCP - Profile queries
router.post('/fortnite/api/game/v2/profile/:accountId/client/:command', (req, res) => {
  const accountId = req.params.accountId;
  const command = req.params.command;
  const profileId = req.query.profileId || "athena";
  const profiles = getProfile(accountId);
  const profile = profiles[profileId] || profiles.athena;

  profile.rvn += 1;
  profile.commandRevision += 1;
  profile.updated = new Date().toISOString();

  // Handle specific commands
  let applyChanges = [];
  let multiUpdate = [];
  
  if (command === "SetMtxPlatform") {
    // pass
  }
  if (command === "ClaimMtxAffinity" || command === "ClaimLoginReward") {
    // grant vbucks
  }

  res.json({
    profileRevision: profile.rvn,
    profileId: profileId,
    profileChangesBaseRevision: profile.rvn - 1,
    profileChanges: [{ changeType: "fullProfileUpdate", profile: profile }],
    profileCommandRevision: profile.commandRevision,
    serverTime: new Date().toISOString(),
    multiUpdate: multiUpdate,
    responseVersion: 1
  });
});

router.post('/fortnite/api/game/v2/profile/:accountId/dedicated_server/:command', (req, res) => {
  res.json({ profileRevision: 0, profileId: "athena", profileChangesBaseRevision: 0, profileChanges: [], serverTime: new Date().toISOString() });
});

router.get('/fortnite/api/game/v2/profile/:accountId/client/:command', (req, res) => res.redirect(307, `/fortnite/api/game/v2/profile/${req.params.accountId}/client/${req.params.command}`));

// Friends / presence
router.get('/friends/api/v1/:accountId/settings', (req, res) => res.json({ acceptInvites: "public" }));
router.get('/friends/api/public/friends/:accountId', (req, res) => res.json([]));
router.get('/friends/api/v1/:accountId/blocklist', (req, res) => res.json([]));
router.get('/presence/api/v1/_/:accountId/last-online', (req, res) => res.json({}));
router.get('/party/api/v1/Fortnite/user/:accountId', (req, res) => res.json({ current: [], pending: [], invites: [], pings: [] }));

// Timeline - Chapter 2 Season 2 Top Secret (2020-02-20 to 2020-06-17, extended for private server to 2030)
router.get('/fortnite/api/calendar/v1/timeline', (req, res) => {
  const begin = config.raw.timeline?.seasonBegin || "2020-02-20T00:00:00.000Z";
  const end = config.raw.timeline?.seasonEnd || "2030-01-01T00:00:00.000Z";
  res.json({
    channels: {
      "client-matchmaking": { states: [{ validFrom: "2020-02-20T00:00:00.000Z", activeEvents: [], state: { region: { NA: { eventFlagsForcedOff: [], eventFlagsForcedOn: [] } } } }], cacheExpire: end },
      "client-events": { states: [{ validFrom: "2020-02-20T00:00:00.000Z", activeEvents: [
        { eventType: `EventFlag.Season${config.raw.season}`, activeUntil: end, activeSince: begin },
        { eventType: "EventFlag.C2S2_TopSecret", activeUntil: end, activeSince: begin },
        { eventType: "EventFlag.SpyGames", activeUntil: end, activeSince: begin }
      ], state: { 
        activeStorefronts: [], 
        eventNamedWeights: {}, 
        seasonNumber: config.raw.season, 
        seasonTemplateId: `AthenaSeason:athenaseason${config.raw.season}`, 
        matchXpBonusPoints: 0, 
        seasonBegin: begin, 
        seasonEnd: end, 
        seasonDisplayedEnd: end, 
        weeklyStoreEnd: end, 
        stwEventStoreEnd: "0001-01-01T00:00:00.000Z", 
        stwWeeklyStoreEnd: "0001-01-01T00:00:00.000Z", 
        sectionStoreEnds: { Featured: end, Special: end }, 
        dailyStoreEnd: end,
        rmResources: { rmReward: "fake" }
      } }], cacheExpire: end }
    },
    eventsTimeOffsetHrs: 0,
    cacheIntervalMins: 10,
    currentTime: new Date().toISOString()
  });
});

// Content pages - C2S2
router.get('/content/api/pages/fortnite-game', (req, res) => {
  res.json({
    _title: "Fortnite Game",
    _activeDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    _locale: "en-US",
    battleroyalenews: {
      _title: "battleroyalenews",
      news: {
        _type: "Battle Royale News",
        messages: [
          { title: "TOP SECRET", body: `Chapter 2 Season 2 is here! Play as Midas, Meowscles, Brutus, TNTina & Skye. Ghost vs Shadow - Choose your side!`, image: "https://cdn2.unrealengine.com/Fortnite/fortnite-game/battleroyalenews/c2s2-keyart-1024x512-1024x512.jpg", adspace: "Welcome to Project Keylix - C2S2 Top Secret (12.41)", hidden: false, _type: "CommonUI Simple Message Base", spotlight: true },
          { title: "Project Keylix", body: `Welcome to Keylix C2S2! All Battle Pass skins unlocked. Spy Games LTM active.`, image: "", adspace: "", hidden: false, _type: "CommonUI Simple Message Base", spotlight: false }
        ],
        platform_messages: []
      }
    },
    emergencynotice: { _title: "emergencynotice", news: { _type: "Battle Royale News", messages: [], platform_messages: [] } },
    dynamicbackgrounds: {
      _title: "dynamicbackgrounds",
      backgrounds: {
        backgrounds: [
          { stage: "season12", _type: "DynamicBackground", key: "lobby", backgroundImage: "https://cdn2.unrealengine.com/Fortnite/dynamicbackgrounds/c2s2-lobby-1920x1080.jpg" }
        ],
        _type: "DynamicBackgroundList"
      }
    }
  });
});
router.get('/content/api/pages/*', (req, res) => res.json({}));

// Matchmaking - return fake ticket
router.get('/fortnite/api/matchmaking/session/findPlayer/:accountId', (req, res) => res.json([]));
router.post('/fortnite/api/matchmaking/session/matchMakingRequest', (req, res) => {
  res.json({
    ticketType: "mms-player",
    payload: "eyJ0aWNrZXRUeXBlIjoiYm1zIn0=",
    signature: "keylix"
  });
});

router.get('/fortnite/api/game/v2/enabled_features', (req, res) => res.json([]));

// EULA + region
router.get('/eulatracking/api/shared/agreements/fn*', (req, res) => res.json([]));
router.get('/fortnite/api/game/v2/privacy/account/:accountId', (req, res) => res.json({}));
router.get('/region', (req, res) => res.json({ continent: { code: "NA" }, country: { code: "US" } }));

module.exports = router;
