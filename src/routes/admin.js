const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');

const ADMIN_KEY = process.env.ADMIN_KEY || 'KeylixAdmin_ChangeMe_123';

// Middleware
function adminAuth(req, res, next){
  const key = req.headers['x-admin-key'] || req.query.key || req.body.key;
  if(key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized - bad admin key' });
  next();
}

// Get shop
router.get('/admin/api/shop', adminAuth, (req, res) => {
  res.json({ shop: config.raw.shop, hostedBuildUrl: config.raw.hostedBuildUrl });
});

// Update shop - { items: [{id, price, type, name}] }
router.post('/admin/api/shop', adminAuth, (req, res) => {
  const { items, hostedBuildUrl } = req.body;
  if(!Array.isArray(items)) return res.status(400).json({ error: 'items must be array' });
  const cfgPath = path.join(__dirname, '../../config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath,'utf8'));
  cfg.shop.items = items;
  if(hostedBuildUrl) cfg.hostedBuildUrl = hostedBuildUrl;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
  // update live config
  config.raw.shop.items = items;
  if(hostedBuildUrl) config.raw.hostedBuildUrl = hostedBuildUrl;
  res.json({ ok:true, shop: cfg.shop });
});

// List users (from memory + persisted accounts)
router.get('/admin/api/users', adminAuth, (req, res) => {
  const accounts = require('../utils/accounts').load();
  const online = global.profiles ? Array.from(global.profiles.entries()).map(([id,p])=>({
    accountId:id,
    athenaItems: Object.keys(p.athena?.items||{}).length,
    online:true
  })) : [];
  res.json({ 
    accounts: Object.values(accounts).map(a=>({ username:a.username, accountId:a.accountId, created:a.created })),
    online,
    total: Object.keys(accounts).length
  });
});

// Grant cosmetic - { username, templateId, quantity }
router.post('/admin/api/grant', adminAuth, (req, res) => {
  const { username, templateId, quantity=1 } = req.body;
  if(!username || !templateId) return res.status(400).json({ error: 'username + templateId required' });
  const accounts = require('../utils/accounts');
  const acc = accounts.getAccount(username);
  if(!acc) return res.status(404).json({ error: 'User not found - they must register first' });

  // Ensure profile exists
  const { getProfile } = require('../utils/profile');
  const profiles = getProfile(acc.accountId);
  const athena = profiles.athena;
  const id = templateId.includes(':') ? templateId : `AthenaCharacter:${templateId}`;
  athena.items[id] = { templateId:id, attributes:{ item_seen:false, favorite:false, variants:[] }, quantity };
  athena.rvn++;
  athena.commandRevision++;
  athena.updated = new Date().toISOString();
  // also update global
  global.profiles.set(acc.accountId, profiles);
  res.json({ ok:true, granted:id, to:username, accountId:acc.accountId, profileRvn: athena.rvn });
});

// Grant to all
router.post('/admin/api/grant-all', adminAuth, (req, res) => {
  const { templateId, quantity=1 } = req.body;
  if(!templateId) return res.status(400).json({ error:'templateId required'});
  const accounts = require('../utils/accounts').load();
  const { getProfile } = require('../utils/profile');
  let count=0;
  for(const acc of Object.values(accounts)){
    const profiles=getProfile(acc.accountId);
    const id=templateId.includes(':')?templateId:`AthenaCharacter:${templateId}`;
    profiles.athena.items[id]={ templateId:id, attributes:{ item_seen:false }, quantity};
    profiles.athena.rvn++;
    count++;
  }
  res.json({ ok:true, granted:templateId, toCount:count });
});

router.get('/admin/api/stats', adminAuth, (req,res)=>{
  const accounts=require('../utils/accounts').load();
  res.json({
    backend: config.raw.displaySeason + ' ' + config.raw.version,
    uptime: process.uptime(),
    accounts: Object.keys(accounts).length,
    onlineProfiles: global.profiles? global.profiles.size : 0,
    shopItems: config.raw.shop.items.length
  });
});

module.exports = router;
