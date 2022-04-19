const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

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


module.exports = {
  clientSelect,
  clientExists,
}
