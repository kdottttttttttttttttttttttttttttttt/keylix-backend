const express = require('express');
const router = express.Router();
const { createToken, verifyToken } = require('../utils/tokens');
const { v4: uuidv4 } = require('uuid');

// Keylix own accounts (launcher register/login) -> POST /keylix/api/register & /keylix/api/login
const accounts = require('../utils/accounts');

router.post('/keylix/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  const r = await accounts.createAccount(username, password, email);
  if (!r.ok) return res.status(400).json({ error: r.msg });
  const data = createToken(r.username, r.accountId);
  global.tokens.set(r.accountId, data.token);
  res.json({ ok:true, accountId: r.accountId, username: r.username, token: data.token });
});

router.post('/keylix/api/login', async (req, res) => {
  const { username, password } = req.body;
  const acc = await accounts.verifyAccount(username, password);
  if (!acc) return res.status(401).json({ error: 'Invalid credentials' });
  const data = createToken(acc.displayName, acc.accountId);
  global.tokens.set(acc.accountId, data.token);
  res.json({ ok:true, accountId: acc.accountId, username: acc.displayName, token: data.token });
});

router.get('/keylix/api/accounts/count', (req, res) => {
  const db = accounts.load();
  res.json({ count: Object.keys(db).length });
});

// POST /account/api/oauth/token (Fortnite game auth - now tries Keylix accounts first, else guest) - handles email as username@keylix.local
router.post('/account/api/oauth/token', async (req, res) => {
  // Fortnite sends email field, but Keylix accounts are username-only - strip domain
  let rawUser = req.body.username || req.body.email || '';
  let username = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser;
  const password = req.body.password;
  
  let displayName = username || `KeylixUser${Math.floor(Math.random()*9999)}`;
  let accountId = uuidv4().replace(/-/g, "");

  if (username && password) {
    const acc = await accounts.verifyAccount(username, password);
    if (acc) {
      displayName = acc.displayName;
      accountId = acc.accountId;
    } else if (await accounts.getAccount(username)) {
      return res.status(401).json({ errorCode: "errors.com.epicgames.account.invalid_account_credentials", errorMessage: "Invalid credentials" });
    }
    // if no account exists, auto-create guest (for quick play)
  }

  const data = createToken(displayName, accountId);

  global.tokens.set(accountId, data.token);

  res.json({
    access_token: data.token,
    expires_in: 28800,
    expires_at: new Date(Date.now() + 28800 * 1000).toISOString(),
    token_type: "bearer",
    refresh_token: data.token,
    refresh_expires: 86400,
    refresh_expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
    account_id: accountId,
    client_id: "ec684b8c687f479fadea3cb2ad83f5c6",
    internal_client: true,
    client_service: "fortnite",
    displayName: displayName,
    app: "fortnite",
    in_app_id: accountId,
    device_id: uuidv4().replace(/-/g, "")
  });
});

// GET /account/api/oauth/verify
router.get('/account/api/oauth/verify', (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: "invalid_token" });
  res.json({
    token: req.headers.authorization,
    session_id: uuidv4().replace(/-/g, ""),
    token_type: "bearer",
    client_id: "ec684b8c687f479fadea3cb2ad83f5c6",
    internal_client: true,
    client_service: "fortnite",
    account_id: decoded.sub,
    expires_in: 28800,
    expires_at: new Date(Date.now() + 28800 * 1000).toISOString(),
    auth_method: "exchange_code",
    displayName: decoded.dn,
    app: "fortnite",
    in_app_id: decoded.sub,
    device_id: "keylix"
  });
});

// DELETE /account/api/oauth/sessions/kill/:token
router.delete('/account/api/oauth/sessions/kill/:token', (req, res) => res.status(204).end());
router.delete('/account/api/oauth/sessions/kill', (req, res) => res.status(204).end());

// GET /account/api/public/account
router.get('/account/api/public/account', (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).end();
  res.json({
    id: decoded.sub,
    displayName: decoded.dn,
    name: decoded.dn,
    email: `${decoded.dn}@keylix.local`,
    failedLoginAttempts: 0,
    lastLogin: new Date().toISOString(),
    numberOfDisplayNameChanges: 0,
    ageGroup: "ADULT",
    headless: false,
    country: "US",
    lastName: "User",
    preferredLanguage: "en",
    canUpdateDisplayName: true,
    tfaEnabled: false,
    emailVerified: true,
    minorVerified: false,
    minorExpected: false,
    hasHashedEmail: false
  });
});

// GET /account/api/public/account/:id
router.get('/account/api/public/account/:accountId', (req, res) => {
  const { accountId } = req.params;
  res.json({
    id: accountId,
    displayName: accountId.slice(0, 8),
    externalAuths: {}
  });
});

// POST /auth/v1/oauth/token - Alternative Epic endpoint
router.post('/auth/v1/oauth/token', (req, res) => res.redirect(307, '/account/api/oauth/token'));

module.exports = router;
