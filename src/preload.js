const os = require('os');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const { EOL } = require('os');
const { ipcRenderer, dialog } = require('electron');
const { version } = require('../package.json');
const { execFile } = require('child_process');

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.toolbar-button.close').addEventListener('click', () => ipcRenderer.send('close-window'));
    document.querySelector('.toolbar-button.minimize').addEventListener('click', () => ipcRenderer.send('minimize-window'));

    document.getElementById('version').textContent = `v ${version}`;
    loadWowUsername();

    document.getElementById('loginButton').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const windowed = document.getElementById('windowed').checked;

        try {
            const wowArgs = ['-uptodate'];

            if (windowed) {
                wowArgs.push('-windowed');
            }

            await fs.writeFile('wow.ses', `${ username }${ EOL }${ password }`);
            ipcRenderer.send('minimize-window');

            if (os.platform() === 'linux' || os.platform() === 'darwin') {
                wowArgs.unshift('WoWClient.exe');
                execFile('wine', wowArgs, () => ipcRenderer.send('maximize-window'));
            } else if (os.platform() === 'win32') {
                execFile('WoWClient.exe', wowArgs, () => ipcRenderer.send('maximize-window'));
            } else {
                dialog.showMessageBox({
                    title: 'Error',
                    message: 'Error running WoWClient',
                    detail: `Platform '${os.platform()}' not supported.`,
                    type: 'error'
                });
            }
        } catch(error) {
            dialog.showMessageBox({
                title: 'Error',
                message: 'Error while login',
                detail: 'Can\'t write wow.ses file.',
                type: 'error'
            });
        }
    });

    loadRealms();
    document.getElementById('realms').addEventListener('click', openChangeRealmModal);
    document.getElementById('clear-cache').addEventListener('click', clearCache);
});

function clearCache() {
    if (existsSync('WDB')) {
        fs.rmdir('WDB', { recursive: true });
    }
}

async function loadWowUsername() {
    const [username, password] = (await fs.readFile('wow.ses')).toString().split(EOL);
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

async function loadRealms() {
    const realmsContainer = document.querySelector('.realms-container');
    realmsContainer.innerHTML = '';
    const list = (await fs.readFile('realmlist.wtf')).toString();
    const realms = list.split('\n').filter(r => r !== '').map(r => ({ selected: !r.startsWith('#'), url: r.substring(r.indexOf('\"') + 1, r.lastIndexOf('\"')) }));

    for (const realm of realms) {
        const realmElement = document.createElement('div');
        realmElement.classList.add('realm');

        if (realm.selected) {
            realmElement.classList.add('selected');
            document.getElementById('realms').textContent = 'Realm: ' + realm.url;
        }

        realmElement.textContent = realm.url;
        realmElement.addEventListener('click', () => changeRealm(realm.url, realms));

        realmsContainer.appendChild(realmElement);
    }
}

function openChangeRealmModal() {
    document.querySelector('.realm-select').style.display = 'flex';
    loadRealms();
}

function changeRealm(realm, realms) {
    document.getElementById('realms').textContent = 'Realm: ' + realm;
    realms = realms.map(r => {
        let str = '';

        if (r.url !== realm){
            str += '#';
        }

        str += `SET realmlist "${r.url}"`;
        return str;
    });

    realms = realms.join(EOL) + EOL;
    fs.writeFile('realmlist.wtf', realms).then(() => {
        document.querySelector('.realm-select').style.display = 'none';
    });
}
