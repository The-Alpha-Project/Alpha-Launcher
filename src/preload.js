const fs = require('fs').promises;
const { EOL } = require('os');
const { ipcRenderer } = require('electron');
const { version } = require('../package.json');

window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.toolbar-button.close').addEventListener('click', () => ipcRenderer.send('close-window'));
    document.querySelector('.toolbar-button.minimize').addEventListener('click', () => ipcRenderer.send('minimize-window'));

    document.getElementById('version').textContent = `v ${version}`;
    loadWowUsername();

    document.getElementById('loginButton').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fs.writeFile('wow.ses', `${username}${EOL}${password}`);
    });

    loadRealms();
    document.getElementById('realms').addEventListener('click', openChangeRealmModal);
});

async function loadWowUsername() {
    const [username, password] = (await fs.readFile('wow.ses')).toString().split(EOL);
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

async function loadRealms() {
    const realmsContainer = document.querySelector('.realms-container');
    realmsContainer.innerHTML = '';
    const list = (await fs.readFile('realmlist.wtf')).toString();
    const realms = list.split('\n').filter(r => r !== '').map(r => ({ selected: !r.startsWith('#'), url: r.substring(r.indexOf('\"') + 1, r.length - 2) }));

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
