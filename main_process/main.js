const {app, BrowserWindow, ipcMain} = require('electron');
const Config = require('electron-store');
const ElectronPreferences = require('electron-preferences');
const os = require('os');
const path = require('path');
const url = require('url');
const {fork} = require('child_process');
const kill = require('tree-kill');
const log = require('electron-log');

log.transports.file.file = 'logs/log.log';

const config = new Config({
    defaults: {
        bounds: {
            width: 800,
            height: 600,
        },
    },
});

let window = null;
const status = {
    working: false,
    child: null
};

/**
 * create window
 */
const createWindow = async () => {

    log.info('window created');

    const {width, height, x, y} = config.get('bounds');
    window = new BrowserWindow({
        x,
        y,
        width,
        height,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true
        },
        icon:path.join(__dirname, '../assets/img/fujitv.ico'),
        modal: true,
        parent: window,
        show: false
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // XXX 開発ツールを有効化
    // window.webContents.openDevTools();

    window.once('ready-to-show', () => {
        window.show();
    });

    ['resize', 'move'].forEach(ev => {
        window.on(ev, () => {
            config.set('bounds', window.getBounds());
        })
    });
    
    window.on('closed', () => {
        window = null;
    });
}


app.on('ready', () => {
    createWindow();
});


/*
 * on SEND
 */
ipcMain.on('SEND', (event, data) => {

    status.working = true;
    let {week} = data;
    let {keyword} = data;

    status.child = fork(require.resolve('../scripts/janken.js'), [week, keyword], {});
    status.child.on('exit', (code, sig) => {
        window.webContents.send('DONE');
    });
    status.child.on('error', (error) => {
        log.error(error);
        window.webContents.send('DONE');
    });
});
    

/*
 * on STOP
 */
ipcMain.on('STOP', (event, data) => {
    status.working = false;
    kill(status.child.pid);
    window.webContents.send('STOPPED');
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});
