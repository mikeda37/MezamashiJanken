const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {fork} = require('child_process');
const kill = require('tree-kill');
const log = require('electron-log');

log.transports.file.file = 'logs/log.log';

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

    window = new BrowserWindow({
        x: 2570,
        y: 250,
        width: 800,
        height: 600,
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
