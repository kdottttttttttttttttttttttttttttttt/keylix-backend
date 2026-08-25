const els = {
  minBtn: document.getElementById('minBtn'),
  closeBtn: document.getElementById('closeBtn'),
  statusDot: document.querySelector('#statusDot .dot'),
  statusText: document.getElementById('statusDot'),
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
  document.getElementById('page-'+b.dataset.page).classList.add('active');
});
els.toDownloadBtn.onclick = () => document.querySelector('[data-page="download"]').click();

let cfg = {};
async function loadCfg(){
  cfg = await window.keylix.getConfig();
  els.username.value = cfg.username || '';
  els.backendUrl.value = cfg.backendUrl || 'http://127.0.0.1:3551';
  els.fortnitePath.value = cfg.fortnitePath || '';
  els.downloadUrl.value = cfg.downloadUrl || localStorage.getItem('downloadUrl') || 'https://example.com/keylix/12.41.zip';
  const m = await window.keylix.epicGetManifest();
  if(document.getElementById('manifestId')) document.getElementById('manifestId').value = m;
  checkBackend();
}
async function checkBackend(){
  const ok = await window.keylix.checkBackend(els.backendUrl.value);
  els.statusDot.className = 'dot ' + (ok ? 'online' : '');
  els.statusText.lastChild.textContent = ' ' + (ok ? 'ONLINE' : 'OFFLINE');
  els.homeLog.textContent = ok ? 'Backend online at ' + els.backendUrl.value : 'Backend offline - start backend with start.bat';
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
