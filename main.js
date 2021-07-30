const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { is } = require('electron-util');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

if (require('electron-squirrel-startup')) return app.quit();

const store = new Store();
let mainWindow;

function selectClientPath() {
    dialog
        .showOpenDialog(mainWindow, {
            title: 'Choose client folder',
            properties: ['openDirectory'],
        })
        .then(({canceled, filePaths}) => {
            if (filePaths.length > 0) {
                const [path] = filePaths;
                if (fs.existsSync(`${path}/WoWClient.exe`)) {
                    store.set('clientPath', path);
                } else {
                    selectClientPath();
                }
            } else {

            }

            if (canceled) {
                app.quit();
            }
        })
        .catch((err) => {
            dialog.showMessageBox({
                title: 'Error while selecting the folder',
                type: 'error',
                message: 'The folder is either not readable or something has gone wrong, please raise an issue on github with the following details',
                detail: JSON.stringify(err),
            }, () => app.quit());
        });
}

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
            preload: path.join(__dirname, 'src/preload.js')
        }
    });

    const clientPath = store.get('clientPath') || '.';
    if (!fs.existsSync(`${clientPath}/WoWClient.exe`)) {
        dialog
            .showMessageBox({
                title: 'WoWClient.exe not found',
                type: 'warning',
                detail: 'WoWClient executable not found, please move launcher to game folder or select the client folder.',
                buttons: ['Exit', 'Choose client folder'],
            })
            .then(({response}) => {
                switch (response) {
                    case 1: {
                        selectClientPath();
                        return;
                    }
                    default: {
                        app.quit();
                        return;
                    }
                }
                
            });

    }

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
