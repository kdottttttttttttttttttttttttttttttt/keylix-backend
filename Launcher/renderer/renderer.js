const els = {
  minBtn: document.getElementById('minBtn'),
  closeBtn: document.getElementById('closeBtn'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusTxt'),
  playBtn: document.getElementById('playBtn'),
  toDownloadBtn: document.getElementById('toDownloadBtn'),
  dlBtn: document.getElementById('dlBtn'),
  locateBtn: document.getElementById('locateBtn'),
  browseBtn: document.getElementById('browseBtn'),
  saveBtn: document.getElementById('saveBtn'),
  username: document.getElementById('username'),
  backendUrl: document.getElementById('backendUrl'),
  fortnitePath: document.getElementById('fortnitePath'),
  downloadUrl: document.getElementById('downloadUrl'),
  progWrap: document.getElementById('progWrap'),
  progBar: document.getElementById('progBar'),
  progText: document.getElementById('progText'),
  progStatus: document.getElementById('progStatus'),
  homeLog: document.getElementById('homeLog'),
  saveMsg: document.getElementById('saveMsg')
};

els.minBtn.onclick = () => window.keylix.minimize();
els.closeBtn.onclick = () => window.keylix.close();

document.querySelectorAll('.nav').forEach(b => b.onclick = () => {
  document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const p=document.getElementById('page-'+b.dataset.page);
  if(p) p.classList.add('active');
  if(b.dataset.page==='shop') loadShop();
});
els.toDownloadBtn.onclick = () => document.querySelector('[data-page="download"]').click();

// Item Shop - live from backend
async function loadShop(){
  const grid=document.getElementById('shopGrid');
  if(!grid) return;
  grid.innerHTML='<div class="muted small">Loading shop...</div>';
  try{
    const r=await fetch(els.backendUrl.value + '/fortnite/api/storefront/v2/catalog');
    const j=await r.json();
    const entries=(j.storefronts && j.storefronts[0] && j.storefronts[0].catalogEntries) || [];
    if(!entries.length) throw new Error('no entries');
    grid.innerHTML='';
    entries.forEach(e=>{
      const price = e.prices && e.prices[0] ? e.prices[0].finalPrice : 0;
      const name = (e.devName||e.offerId||'Item').replace('AthenaCharacter:','').replace('CID_','').slice(0,22);
      const div=document.createElement('div');
      div.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;transition:all 0.2s;cursor:pointer';
      div.onmouseenter=()=>{div.style.transform='translateY(-2px)';div.style.borderColor='var(--border2)'};
      div.onmouseleave=()=>{div.style.transform='';div.style.borderColor='var(--border)'};
      div.innerHTML=`<div style="height:90px;background:linear-gradient(135deg, var(--card2), var(--bg));border-radius:8px;display:grid;place-items:center;font-size:10px;color:var(--muted);font-weight:700;margin-bottom:8px">${name}</div><div style="font-size:11px;font-weight:800">${e.devName?e.devName.slice(0,28):e.offerId.slice(0,28)}</div><div style="font-size:11px;color:var(--gold);font-weight:800;margin-top:4px">${price===0?'FREE':price+' V-Bucks'}</div>`;
      grid.appendChild(div);
    });
  }catch(err){
    // fallback to config items
    grid.innerHTML='';
    const fallback=[
      {name:'Meowscles', price:1200},{name:'Brutus', price:1200},{name:'TNTina', price:1200},{name:'Midas', price:1500},{name:'Skye', price:1200},{name:'Maya', price:1200}
    ];
    fallback.forEach(f=>{
      const d=document.createElement('div');
      d.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px';
      d.innerHTML=`<div style="height:90px;background:var(--card2);border-radius:8px;display:grid;place-items:center;font-size:11px;font-weight:800">${f.name}</div><div style="font-size:11px;font-weight:800;margin-top:8px">${f.name}</div><div style="color:var(--gold);font-size:11px;font-weight:800">${f.price} V-Bucks</div>`;
      grid.appendChild(d);
    });
  }
}

let cfg = {};
async function loadCfg(){
  cfg = await window.keylix.getConfig();
  els.username.value = cfg.username || '';
  els.backendUrl.value = cfg.backendUrl || 'https://keylix-backend.onrender.com';
  els.fortnitePath.value = cfg.fortnitePath || '';
  els.downloadUrl.value = cfg.downloadUrl || localStorage.getItem('downloadUrl') || 'https://example.com/keylix/12.41.zip';
  const m = await window.keylix.epicGetManifest();
  if(document.getElementById('manifestId')) document.getElementById('manifestId').value = m;
  // login wall
  const wall=document.getElementById('loginWall');
  const userLabel=document.getElementById('userLabel');
  const settingsUser=document.getElementById('settingsUser');
  if(cfg.isLoggedIn && cfg.username){
    if(wall) wall.classList.add('hidden');
    if(userLabel) userLabel.textContent=cfg.username;
    if(settingsUser) settingsUser.textContent=cfg.username;
    document.getElementById('welcomeName').textContent=cfg.username;
  } else {
    if(wall) wall.classList.remove('hidden');
  }
  checkBackend();
}
function switchTab(t){
  document.getElementById('tabLogin').classList.toggle('active', t==='login');
  document.getElementById('tabSignup').classList.toggle('active', t==='signup');
  document.getElementById('authBtn').textContent = t==='signup' ? 'Create Account' : 'Login';
  document.getElementById('authEmail').style.display = t==='signup' ? 'block' : 'none';
  window._authMode=t;
}
window.switchTab=switchTab;
window._authMode='login';
async function doAuth(){
  const u=document.getElementById('authUser').value.trim();
  const p=document.getElementById('authPass').value;
  const e=document.getElementById('authEmail').value.trim();
  const msg=document.getElementById('loginMsg');
  if(!u||!p) return msg.textContent='Fill username + password';
  msg.textContent='...';
  const fn = window._authMode==='signup' ? window.keylix.keylixRegister : window.keylix.keylixLogin;
  const r=await fn({ backendUrl: els.backendUrl.value, username:u, password:p, email:e });
  if(r.ok){
    msg.textContent='Success!';
    els.username.value=u;
    await window.keylix.saveConfig({ username:u, fortnitePath: els.fortnitePath.value });
    document.getElementById('loginWall').classList.add('hidden');
    document.getElementById('userLabel').textContent=u;
    document.getElementById('settingsUser').textContent=u;
    document.getElementById('welcomeName').textContent=u;
    els.homeLog.textContent='Logged in as '+u;
  } else msg.textContent='Failed: '+r.msg;
}
window.doAuth=doAuth;
function logout(){
  window.keylix.saveConfig({ username: '' });
  localStorage.clear();
  // clear store via main - just clear username
  document.getElementById('loginWall').classList.remove('hidden');
}
window.logout=logout;
async function checkBackend(){
  const ok = await window.keylix.checkBackend(els.backendUrl.value);
  if(els.statusDot) els.statusDot.className = ok ? 'pulse online' : 'pulse';
  if(els.statusText) els.statusText.textContent = ok ? 'ONLINE' : 'OFFLINE';
  const pc = document.getElementById('playerCount');
  if(pc) pc.textContent = ok ? '500 Players Online' : 'Offline';
  if(document.getElementById('welcomeName') && els.username.value) document.getElementById('welcomeName').textContent = els.username.value;
  const hpc=document.getElementById('homePlayerCount'); if(hpc) hpc.textContent = ok ? '500 Online' : 'Offline';
  // sync visible settings fields
  const b2=document.getElementById('backendUrl2'); if(b2) b2.value=els.backendUrl.value;
  const f2=document.getElementById('fortnitePath2'); if(f2) f2.value=els.fortnitePath.value;
  const d2=document.getElementById('downloadUrl2'); if(d2) d2.value=els.downloadUrl.value;
  els.homeLog.textContent = ok ? 'Online • Ready to launch' : 'Offline • Retrying...';
}
loadCfg();
els.backendUrl.onchange = checkBackend;

els.browseBtn.onclick = async () => {
  const p = await window.keylix.selectPath();
  if(p) els.fortnitePath.value = p;
};
els.locateBtn.onclick = async () => {
  const p = await window.keylix.selectPath();
  if(p) { els.fortnitePath.value = p; localStorage.setItem('path', p); els.homeLog.textContent = 'Path set to '+p; }
};
els.saveBtn.onclick = async () => {
  await window.keylix.saveConfig({ username: els.username.value, backendUrl: els.backendUrl.value, fortnitePath: els.fortnitePath.value });
  localStorage.setItem('downloadUrl', els.downloadUrl.value);
  els.saveMsg.textContent = 'Saved!';
  setTimeout(()=>els.saveMsg.textContent='',1500);
  checkBackend();
};

els.playBtn.onclick = async () => {
  const c = { fortnitePath: els.fortnitePath.value, backendUrl: els.backendUrl.value, username: els.username.value || kUsername.value || 'KeylixUser', password: usernamePass ? usernamePass.value : (kPassword ? kPassword.value : '') };
  if(!c.fortnitePath) return els.homeLog.textContent = 'Set Fortnite path in Settings first!';
  if(!c.username) return els.homeLog.textContent = 'Create account on Home first!';
  c.username = c.username.trim();
  // save for next launch
  els.username.value = c.username;
  els.homeLog.textContent = `Launching as ${c.username}...`;
  const r = await window.keylix.launch(c);
  els.homeLog.textContent = r.ok ? `Launched as ${c.username}!` : 'Error: '+r.msg;
};

els.dlBtn.onclick = async () => {
  const url = els.downloadUrl.value.trim();
  const dest = els.fortnitePath.value || await window.keylix.selectPath();
  if(!dest) return;
  if(url.includes('example.com')) {
    alert('Set your real download URL in Settings first!\n\nUpload 12.41.zip to Drive/Mega/S3 and paste direct link.\nFor now use Epic Pull above.');
    return;
  }
  els.progWrap.classList.remove('hidden');
  els.dlBtn.disabled = true;
  els.homeLog.textContent = 'Downloading hosted zip...';
  window.keylix.onProgress(({pct, done, total}) => {
    els.progBar.style.width = pct+'%';
    els.progText.textContent = pct+'% ' + (done/1e6).toFixed(1) + 'MB / ' + (total/1e6).toFixed(1)+'MB';
  });
  window.keylix.onStatus(s => els.progStatus.textContent = s);
  try {
    const out = await window.keylix.downloadBuild({ url, dest });
    els.homeLog.textContent = 'Download complete: '+out;
    els.progStatus.textContent = 'Done!';
  } catch(e) {
    els.homeLog.textContent = 'Download failed: '+e;
    els.progStatus.textContent = 'Failed';
  }
  els.dlBtn.disabled = false;
};

// Keylix account create/login (no Epic)
const kUsername = document.getElementById('kUsername');
const kPassword = document.getElementById('kPassword');
const kEmail = document.getElementById('kEmail');
const kAuthMsg = document.getElementById('kAuthMsg');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const usernamePass = document.getElementById('usernamePass');
if(registerBtn) registerBtn.onclick = async () => {
  const u=kUsername.value.trim(), p=kPassword.value, e=kEmail.value.trim();
  if(!u||!p) return kAuthMsg.textContent='Fill username + password';
  kAuthMsg.textContent='Creating...';
  const r = await window.keylix.keylixRegister({ backendUrl: els.backendUrl.value, username:u, password:p, email:e });
  kAuthMsg.textContent = r.ok ? `Created! Logged in as ${u} - now hit PLAY` : `Failed: ${r.msg}`;
  if(r.ok){ els.username.value=u; usernamePass.value=p; els.homeLog.textContent='Account '+u+' ready - hit PLAY'; }
};
if(loginBtn) loginBtn.onclick = async () => {
  const u=kUsername.value.trim(), p=kPassword.value;
  if(!u||!p) return kAuthMsg.textContent='Fill username + password';
  kAuthMsg.textContent='Logging in...';
  const r = await window.keylix.keylixLogin({ backendUrl: els.backendUrl.value, username:u, password:p });
  kAuthMsg.textContent = r.ok ? `Logged in as ${u}` : `Failed: ${r.msg}`;
  if(r.ok){ els.username.value=u; usernamePass.value=p; els.homeLog.textContent='Logged in '+u; }
};
if(usernamePass) usernamePass.onchange = () => { if(els.username.value) localStorage.setItem('keylixPass', usernamePass.value); };

// Epic CDN download
const epicEmail = document.getElementById('epicEmail');
const epicPass = document.getElementById('epicPass');
const epicDlBtn = document.getElementById('epicDlBtn');
const epicProgWrap = document.getElementById('epicProgWrap');
const epicProgBar = document.getElementById('epicProgBar');
const epicProgText = document.getElementById('epicProgText');
const epicProgStatus = document.getElementById('epicProgStatus');
const manifestId = document.getElementById('manifestId');
const epicHelpBtn = document.getElementById('epicHelpBtn');

if(manifestId) manifestId.onchange = () => window.keylix.epicSaveManifest(manifestId.value);

if(epicHelpBtn) epicHelpBtn.onclick = () => alert("Epic Pull:\n1. Enter your Epic email/pass (account that owns Fortnite)\n2. Pick where to save in Settings -> Fortnite Path\n3. Click Epic Pull\n\nIt will auto-download DepotDownloader (~5MB) then pull 12.41 (~20GB) from Epic CDN.\nIf it fails with 2FA, login once in browser first or use an app password.\nManifest ID is preset for 12.41, don't change unless you know another.");
if(epicDlBtn) epicDlBtn.onclick = async () => {
  const dest = els.fortnitePath.value || await window.keylix.selectPath();
  if(!dest) return alert('Set Fortnite Path in Settings first (where to save build)');
  if(!epicEmail.value || !epicPass.value) return alert('Enter Epic email + password that owns Fortnite');
  await window.keylix.epicSaveManifest(manifestId.value);
  epicProgWrap.classList.remove('hidden');
  epicDlBtn.disabled = true;
  els.homeLog.textContent = 'Epic CDN download started - check Download tab for progress...';
  window.keylix.onProgress(({pct}) => { epicProgBar.style.width=pct+'%'; epicProgText.textContent=pct+'%'; });
  window.keylix.onStatus(s => epicProgStatus.textContent = s);
  const r = await window.keylix.epicDownload({ dest, username: epicEmail.value, password: epicPass.value });
  if(r.ok) { els.homeLog.textContent='Epic download DONE at '+dest+' - now hit PLAY!'; epicProgStatus.textContent='Complete! Go to Home -> Play'; }
  else { els.homeLog.textContent='Epic failed: '+r.msg; epicProgStatus.textContent='Failed - see Home log'; alert(r.msg); }
  epicDlBtn.disabled=false;
};
