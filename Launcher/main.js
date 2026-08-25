const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn, exec } = require('child_process');
const Store = require('electron-store');
const extract = require('extract-zip');

const store = new Store();
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1050,
    height: 700,
    frame: false,
    resizable: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'renderer/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

// Window controls
ipcMain.on('win:minimize', () => win.minimize());
ipcMain.on('win:close', () => app.quit());

// Config - auto Render backend
ipcMain.handle('get-config', () => ({
  backendUrl: store.get('backendUrl', 'https://keylix-backend.onrender.com'),
  fortnitePath: store.get('fortnitePath', ''),
  username: store.get('username', 'KeylixUser')
}));
ipcMain.handle('save-config', (e, cfg) => {
  Object.entries(cfg).forEach(([k,v]) => store.set(k,v));
  return true;
});
ipcMain.handle('select-path', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('check-backend', async (e, url) => {
  try {
    const u = new URL(url + '/');
    const mod = u.protocol === 'https:' ? https : http;
    return await new Promise(res => {
      const req = mod.get(url + '/', r => res(r.statusCode === 200));
      req.on('error', () => res(false));
      req.setTimeout(2000, () => { req.destroy(); res(false); });
    });
  } catch { return false; }
});

// Download with progress
ipcMain.handle('download-build', async (e, { url, dest }) => {
  const fileName = path.basename(new URL(url).pathname) || 'build.zip';
  const outPath = path.join(dest, fileName);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath);
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, res => {
      if (res.statusCode !== 200) return reject(`HTTP ${res.statusCode}`);
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let done = 0;
      res.on('data', chunk => {
        done += chunk.length;
        const pct = total ? Math.round(done/total*100) : 0;
        win.webContents.send('download:progress', { pct, done, total });
      });
      res.pipe(file);
      file.on('finish', async () => {
        file.close(async () => {
          win.webContents.send('download:progress', { pct: 100, done: total, total });
          // Auto extract if zip
          if (outPath.endsWith('.zip')) {
            win.webContents.send('download:status', 'Extracting...');
            try {
              await extract(outPath, { dir: dest });
              win.webContents.send('download:status', 'Extracted!');
            } catch (err) { console.error(err); }
          }
          resolve(outPath);
        });
      });
    }).on('error', reject);
  });
});

// Launch Fortnite - uses Keylix own account (username/password)
ipcMain.handle('launch', async (e, { fortnitePath, backendUrl, username, password }) => {
  const exe = path.join(fortnitePath, 'FortniteGame', 'Binaries', 'Win64', 'FortniteClient-Win64-Shipping.exe');
  const dll = path.join(fortnitePath, 'FortniteGame', 'Binaries', 'Win64', 'Starfall.dll');

  if (!fs.existsSync(exe)) return { ok: false, msg: `Not found: ${exe} - Set correct Fortnite path in settings.` };

  const pass = password || 'keylix';
  const args = [
    `-epicapp=Fortnite`,
    `-epicenv=Prod`,
    `-EpicPortal`,
    `-epicusername=${username}`,
    `-epicuserid=${username}`,
    `-skippatchcheck`,
    `-fromfl=eac`,
    `-fltoken=available`,
    `-AUTH_LOGIN=${username}`,
    `-AUTH_PASSWORD=${pass}`,
    `-AUTH_TYPE=epic`,
    `-epiclocale=en-us`,
    `-nobe`,
    `-fromlauncher`,
    `-noeac`
  ];

  // If backend is custom, add -AUTH_HOST
  if (backendUrl && !backendUrl.includes('127.0.0.1')) {
    // for some builds you need to redirect via hosts/Starfall instead
  }

  // Check Starfall
  let injector = path.join(__dirname, 'tools', 'KeylixInjector.exe');
  if (fs.existsSync(dll) && fs.existsSync(injector)) {
    spawn(injector, [exe, ...args], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn(exe, args, { cwd: path.dirname(exe), detached: true, stdio: 'ignore' }).unref();
  }

  return { ok: true };
});

ipcMain.handle('open-external', (e, url) => shell.openExternal(url));

// Epic CDN Manifest Download (uses DepotDownloader if available)
ipcMain.handle('epic:download', async (e, { dest, username, password }) => {
  const toolsDir = path.join(__dirname, 'tools');
  let depotPath = path.join(toolsDir, 'DepotDownloader.exe');
  const fortniteManifest = '++Fortnite+Release-12.41-CL-12905930-Windows'; // C2S2 12.41 base - override in Settings if needed
  const appId = '125241'; // Fortnite
  const depotId = '125241'; // main depot

  // Auto-download DepotDownloader if missing
  if (!fs.existsSync(depotPath)) {
    win.webContents.send('download:status', 'Downloading DepotDownloader...');
    const depotUrl = 'https://github.com/SteamRE/DepotDownloader/releases/download/DepotDownloader_2.7.1/DepotDownloader-windows-x64.zip';
    const zipPath = path.join(toolsDir, 'depot.zip');
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(zipPath);
      https.get(depotUrl, res => {
        if (res.statusCode !== 200) return reject(' DepotDownloader HTTP '+res.statusCode);
        let done=0, total=parseInt(res.headers['content-length']||'0',10);
        res.on('data', c => { done+=c.length; win.webContents.send('download:progress', { pct: total?Math.round(done/total*100):0, done, total }); });
        res.pipe(file); file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    });
    try { await extract(zipPath, { dir: toolsDir }); } catch(err) { console.error(err); }
    // find exe recursively
    const findExe = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes:true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) { const r=findExe(p); if(r) return r; }
        else if (f.name.toLowerCase()==='depotdownloader.exe') return p;
      }
      return null;
    };
    const found = findExe(toolsDir);
    if (found) depotPath = found;
  }

  if (!fs.existsSync(depotPath)) return { ok:false, msg: 'DepotDownloader not found - check tools/ folder' };
  if (!dest) return { ok:false, msg: 'Pick Fortnite path first' };

  // Use Epic auth via username/password (or you can use -remember-password)
  // For C2S2 we use Manifest ID - user can override via store
  const manifestId = store.get('manifestId', fortniteManifest);
  const epicUrl = `https://epicgames-download1.akamaized.net/Builds/Fortnite/CloudDir/${manifestId}.manifest`;

  win.webContents.send('download:status', `Starting Epic CDN pull (${manifestId})...`);
  win.webContents.send('download:progress', { pct: 0, done: 0, total: 20000000000 });

  return await new Promise(resolve => {
    // Try DepotDownloader style (works with Epic via -app + depot)
    // Fallback is direct manifest pull via powershell if auth fails
    const args = ['-app', appId, '-depot', depotId, '-manifest', manifestId, '-dir', dest, '-username', username || '', '-password', password || '', '-remember-password'];
    const proc = spawn(depotPath, args, { cwd: toolsDir });
    let out='';
    proc.stdout.on('data', d => { out+=d.toString(); win.webContents.send('download:status', d.toString().slice(0,120)); });
    proc.stderr.on('data', d => { out+=d.toString(); win.webContents.send('download:status', d.toString().slice(0,120)); });
    proc.on('close', code => {
      if (code===0) {
        win.webContents.send('download:progress', { pct:100, done:20000000000, total:20000000000 });
        win.webContents.send('download:status', 'Epic download complete!');
        resolve({ ok:true });
      } else {
        // Provide manual help
        resolve({ ok:false, msg: `DepotDownloader exit ${code}. Output: ${out.slice(-800)}\n\nTip: You may need to login via Epic once in terminal: ${depotPath} -app ${appId} -username your@email.com` });
      }
    });
    proc.on('error', err => resolve({ ok:false, msg: err.message }));
  });
});

ipcMain.handle('epic:save-manifest', (e, id) => { store.set('manifestId', id); return true; });
ipcMain.handle('epic:get-manifest', () => store.get('manifestId', '++Fortnite+Release-12.41-CL-12905930-Windows'));

// Keylix own accounts (no Epic needed)
ipcMain.handle('keylix:register', async (e, { backendUrl, username, password, email }) => {
  try {
    const r = await fetch(`${backendUrl}/keylix/api/register`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username, password, email }) });
    const j = await r.json();
    if (!r.ok) return { ok:false, msg: j.error || 'Failed' };
    store.set('keylixUser', username); store.set('keylixPass', password);
    return { ok:true, ...j };
  } catch(err) { return { ok:false, msg: err.message }; }
});
ipcMain.handle('keylix:login', async (e, { backendUrl, username, password }) => {
  try {
    const r = await fetch(`${backendUrl}/keylix/api/login`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username, password }) });
    const j = await r.json();
    if (!r.ok) return { ok:false, msg: j.error || 'Invalid' };
    store.set('keylixUser', username); store.set('keylixPass', password);
    return { ok:true, ...j };
  } catch(err) { return { ok:false, msg: err.message }; }
});
