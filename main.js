const { app, BrowserWindow, ipcMain } = require('electron');
const { is } = require('electron-util');
const path = require('path');
const { clientExists } = require( path.resolve((process.resourcePath || './src'), 'utils', 'client-check') );

if (require('electron-squirrel-startup')) {
    app.exit(1);
    return;
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        backgroundColor: '#fff',
        width: 800,
        height: 500,
        frame: is.development,
        titleBarStyle: is.development ? 'default' : 'hidden',
        icon: is.linux ? path.join(__dirname, '../../icon.ico') : path.join(__dirname, '/icon.ico'),
        webPreferences: {
            devTools: is.development,
            preload: path.join(__dirname, 'src/preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    // Ask for client path
    clientExists();

    mainWindow.loadFile('src/index.html');
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.on('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        mainWindow.unmaximize();
    }
});
