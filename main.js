const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

if (require('electron-squirrel-startup')) return app.quit();

let mainWindow;

function createWindow() {
    if (!fs.existsSync('WoWClient.exe')) {
        dialog.showMessageBox({
            message: 'WoWClient.exe not found',
            type: 'error',
            title: 'WoWClient.exe not found',
            detail: 'WoWClient executable not found, move launcher to game folder.'
        }).then(() => app.quit());

        return;
    }

    mainWindow = new BrowserWindow({
        backgroundColor: '#fff',
        width: 800,
        height: 500,
        frame: false,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'src/assets/icon.png'),
        webPreferences: {
            devTools: false,
            preload: path.join(__dirname, 'src/preload.js')
        }
    });

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
