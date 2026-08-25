const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../../data/accounts.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function save(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getAccount(username) {
  const db = load();
  return db[username.toLowerCase()] || null;
}

function createAccount(username, password, email='') {
  const db = load();
  const key = username.toLowerCase();
  if (db[key]) return { ok:false, msg: 'Username taken' };
  if (!username || username.length < 3) return { ok:false, msg: 'Username min 3 chars' };
  if (!password || password.length < 4) return { ok:false, msg: 'Password min 4 chars' };
  
  const accountId = uuidv4().replace(/-/g, '');
  const hash = bcrypt.hashSync(password, 10);
  db[key] = { accountId, username, displayName: username, email, passwordHash: hash, created: new Date().toISOString() };
  save(db);
  return { ok:true, accountId, username };
}

function verifyAccount(username, password) {
  const acc = getAccount(username);
  if (!acc) return null;
  if (!bcrypt.compareSync(password, acc.passwordHash)) return null;
  return acc;
}

module.exports = { getAccount, createAccount, verifyAccount, load };
