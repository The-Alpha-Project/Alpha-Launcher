const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { is } = require('electron-util');
const fs = require('fs');
const Store = require('electron-store');
const path = require('path');

const store = new Store();

if (require('electron-squirrel-startup')) {
    app.exit(1);
    return;
}

function clientSelect() {
    const mainWindow = BrowserWindow.getFocusedWindow();
    mainWindow.setAlwaysOnTop(false);
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
                    // Retrigger dialog
                    clientExists();
                }
            } else {

            }

            if (canceled) {
                app.exit(1);
            }
        })
        .catch((err) => {
            dialog.showMessageBox({
                title: 'Error while selecting the folder',
                type: 'error',
                message: `
                    The folder is either not readable or something has gone wrong, the launcher now will close.
                    Please raise an issue on github with the following details:
                `,
                detail: JSON.stringify(err),
            }, () => app.exit(1));
        });
    mainWindow.setAlwaysOnTop(true);
}

function clientExists() {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const clientPath = store.get('clientPath') || '.';
    if (!fs.existsSync(`${clientPath}/WoWClient.exe`)) {
        dialog
            .showMessageBox(mainWindow, {
                title: 'WoWClient.exe not found',
                type: 'warning',
                detail: 'WoWClient executable not found, please move launcher to game folder or select the client folder.',
                buttons: ['Exit', 'Choose client folder'],
            })
            .then(({response}) => {
                switch (response) {
                    case 1: {
                        clientSelect();
                        return;
                    }
                    default: {
                        app.exit(0);
                        return;
                    }
                }

            });

    }
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
