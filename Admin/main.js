const { app, BrowserWindow } = require('electron');
const path = require('path');
let win;
function createWindow(){
  win = new BrowserWindow({
    width: 1100, height: 720,
    backgroundColor:'#070a12',
    icon: path.join(__dirname,'../Launcher/renderer/icon.png'),
    webPreferences:{ nodeIntegration:true, contextIsolation:false }
  });
  win.loadFile(path.join(__dirname,'renderer/index.html'));
}
app.whenReady().then(createWindow);
app.on('window-all-closed',()=>app.quit());
