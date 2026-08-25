const { v4: uuidv4 } = require('uuid');

function createDefaultProfile(accountId) {
  return {
    _id: accountId,
    accountId,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    rvn: 782,
    wipeNumber: 1,
    stats: {
      attributes: {
        past_seasons: [],
        season_match_boost: 0,
        loadouts: {},
        mtx_purchased: 99999,
        book_level: 100,
        book_xp: 99999,
        book_purchased: true,
        battlestars: 9999,
        battlestars_season_total: 9999,
        season_num: 12,
        book_info: { purchased: true, level: 100 },
        accountLevel: 100,
        level: 100,
        xp: 999999,
        season: { numWins: 50, numHighBracket: 10, numLowBracket: 20 },
        favorite_character: "AthenaCharacter:CID_690_Athena_Commando_M_UltraThief",
        favorite_backpack: "",
        favorite_pickaxe: "AthenaPickaxe:Pickaxe_ID_108_SpyTech",
        favorite_glider: "AthenaGlider:Glider_ID_090_SpyUmbrella",
        favorite_skydivecontrail: "",
        favorite_musicpack: "",
        favorite_loadingscreen: ""
      }
    },
    items: {
      // Chapter 2 Season 2 - Top Secret - Full BP unlocked
      "AthenaCharacter:CID_694_Athena_Commando_F_Skye": { templateId: "AthenaCharacter:CID_694_Athena_Commando_F_Skye", attributes: { max_level_bonus: 0, level: 1, item_seen: true, xp: 0, variants: [{ channel: "Material", active: "Mat1", owned: ["Mat1","Mat2","Mat3"] }, { channel: "Particle", active: "Mat1", owned: ["Mat1","Mat2"] }], favorite: false }, quantity: 1 },
      "AthenaCharacter:CID_693_Athena_Commando_M_Kit": { templateId: "AthenaCharacter:CID_693_Athena_Commando_M_Kit", attributes: { item_seen: true, variants: [], favorite: false }, quantity: 1 },
      "AthenaCharacter:CID_691_Athena_Commando_M_SpyBrute": { templateId: "AthenaCharacter:CID_691_Athena_Commando_M_SpyBrute", attributes: { item_seen: true, variants: [{ channel: "GhostShadow", active: "Ghost", owned: ["Ghost","Shadow"] }], favorite: false }, quantity: 1 },
      "AthenaCharacter:CID_692_Athena_Commando_F_SpyTNTina": { templateId: "AthenaCharacter:CID_692_Athena_Commando_F_SpyTNTina", attributes: { item_seen: true, variants: [{ channel: "GhostShadow", active: "Ghost", owned: ["Ghost","Shadow"] }], favorite: false }, quantity: 1 },
      "AthenaCharacter:CID_690_Athena_Commando_M_UltraThief": { templateId: "AthenaCharacter:CID_690_Athena_Commando_M_UltraThief", attributes: { item_seen: true, variants: [{ channel: "GhostShadow", active: "Shadow", owned: ["Ghost","Shadow"] }], favorite: true }, quantity: 1 },
      "AthenaCharacter:CID_695_Athena_Commando_F_YachtSpy": { templateId: "AthenaCharacter:CID_695_Athena_Commando_F_YachtSpy", attributes: { item_seen: true, variants: [], favorite: false }, quantity: 1 },
      "AthenaCharacter:CID_696_Athena_Commando_M_PeelyAgent": { templateId: "AthenaCharacter:CID_696_Athena_Commando_M_PeelyAgent", attributes: { item_seen: true, variants: [], favorite: false }, quantity: 1 },
      "AthenaDance:EID_TechStep": { templateId: "AthenaDance:EID_TechStep", attributes: { item_seen: true, favorite: false }, quantity: 1 },
      "AthenaPickaxe:Pickaxe_ID_108_SpyTech": { templateId: "AthenaPickaxe:Pickaxe_ID_108_SpyTech", attributes: { item_seen: true, favorite: false }, quantity: 1 },
      "AthenaGlider:Glider_ID_090_SpyUmbrella": { templateId: "AthenaGlider:Glider_ID_090_SpyUmbrella", attributes: { item_seen: true, favorite: false }, quantity: 1 },
      "AthenaBackpack:BID_105_SpyCase": { templateId: "AthenaBackpack:BID_105_SpyCase", attributes: { item_seen: true, favorite: false }, quantity: 1 },
      "Token:athenaseason12_battlepass": { templateId: "Token:athenaseason12_battlepass", attributes: { item_seen: true }, quantity: 1 },
      "Currency:MtxGiveaway": { templateId: "Currency:MtxGiveaway", attributes: { item_seen: true }, quantity: 0 }
    },
    commandRevision: 782
  };
}

function getProfile(accountId) {
  if (!global.profiles.has(accountId)) {
    global.profiles.set(accountId, {
      athena: createDefaultProfile(accountId),
      common_core: {
        _id: accountId,
        accountId,
        rvn: 0,
        items: {
          "Currency:MtxPurchased": { templateId: "Currency:MtxPurchased", attributes: { platform: "EpicPC" }, quantity: 99999 }
        },
        stats: { attributes: { mtx_affiliate: "", mtx_purchase_history: [], current_mtx_platform: "EpicPC" } }
      }
    });
  }
  return global.profiles.get(accountId);
}

module.exports = { createDefaultProfile, getProfile };
