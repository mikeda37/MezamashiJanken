const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {exec} = require('child_process');

let window = null;

/**
 * create window
 */
const createWindow = async () => {

    window = new BrowserWindow({
        x: 10,
        y: 10,
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
    window.webContents.openDevTools();

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


ipcMain.on('send', (event, data) => {

    let {week} = data;
    let {keyword} = data;
    const command = 'node scripts/janken.js ' + week + ' ' + keyword;
    
    exec(command, {},
        (err, stdout, stderr) => {
            if (err) {throw err;}
            window.webContents.send('done');
        }
    );
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
