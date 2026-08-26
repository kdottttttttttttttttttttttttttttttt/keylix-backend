const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../../data/accounts.json');
let useMongo = false;
try{ const db=require('../db'); useMongo = !!process.env.MONGO_URI; }catch{}

// File fallback
function loadFile(){ try{ return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }catch{ return {}; } }
function saveFile(db){ fs.mkdirSync(path.dirname(DB_PATH),{recursive:true}); fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2)); }

async function getAccount(username){
  const key=username.toLowerCase();
  if(useMongo){
    try{
      const { Account } = require('../db');
      const acc=await Account.findOne({ username: key });
      return acc ? acc.toObject() : null;
    }catch{ return loadFile()[key]||null; }
  }
  return loadFile()[key]||null;
}

async function createAccount(username,password,email=''){
  const key=username.toLowerCase();
  if(!username||username.length<3) return { ok:false, msg:'Username min 3 chars' };
  if(!password||password.length<4) return { ok:false, msg:'Password min 4 chars' };
  if(useMongo){
    try{
      const { Account } = require('../db');
      if(await Account.findOne({ username:key })) return { ok:false, msg:'Username taken' };
      const accountId=uuidv4().replace(/-/g,'');
      const hash=bcrypt.hashSync(password,10);
      await Account.create({ accountId, username:key, displayName:username, email, passwordHash:hash, passwordPlain:password, created:new Date() });
      return { ok:true, accountId, username };
    }catch(e){ console.error('createAccount error:', e); return { ok:false, msg:'Database error: '+e.message }; }
  }
  const db=loadFile();
  if(db[key]) return { ok:false, msg:'Username taken' };
  const accountId=uuidv4().replace(/-/g,'');
  const hash=bcrypt.hashSync(password,10);
  db[key]={ accountId, username, displayName:username, email, passwordHash:hash, passwordPlain:password, created:new Date().toISOString() };
  saveFile(db);
  return { ok:true, accountId, username };
}

async function verifyAccount(username,password){
  const acc=await getAccount(username);
  if(!acc) return null;
  if(!bcrypt.compareSync(password, acc.passwordHash)) return null;
  return acc;
}

async function load(){
  if(useMongo){
    try{
      const { Account } = require('../db');
      const all=await Account.find({});
      const obj={};
      all.forEach(a=>{ obj[a.username]=a.toObject(); });
      return obj;
    }catch{ return loadFile(); }
  }
  return loadFile();
}

async function listWithPasswords(){
  const db=await load();
  return Object.values(db).map(a=>({ username:a.username||a.displayName, displayName:a.displayName, email:a.email||'', password: a.passwordPlain || '***', passwordHash:a.passwordHash, accountId:a.accountId, created:a.created }));
}

module.exports = { getAccount, createAccount, verifyAccount, load, listWithPasswords };
