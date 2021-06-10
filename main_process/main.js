const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const Config = require('electron-store');
const ElectronPreferences = require('electron-preferences');
const path = require('path');
const url = require('url');
const {fork} = require('child_process');
const kill = require('tree-kill');

const {epOptions, applicantInfoTemplate} = require('./electron_preferences_options');
epOptions.dataStore = path.resolve(app.getPath('userData'), 'preferences.json');

const config = new Config({
    defaults: {
        bounds: {
            width: 770,
            height: 800,
        },
        numOfApplicants: 1,
    },
});

let window = null;
let epWindow = null;
const status = {
    working: false,
    child: null
};

const numOfApplicants = config.get('numOfApplicants');
for (let i = 0; i < numOfApplicants; i++) {
    let applicantInfo = JSON.parse(JSON.stringify(applicantInfoTemplate));
    applicantInfo.id += (i + 1);
    applicantInfo.label += ' ' + (i + 1);
    applicantInfo.form.groups[0].label += ' ' + (i + 1);
    epOptions.sections.push(applicantInfo);
}
epWindow = new ElectronPreferences(epOptions);


/**
 * create window
 */
const createWindow = async () => {

    const {width, height, x, y} = config.get('bounds');
    window = new BrowserWindow({
        x,
        y,
        width,
        height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../render_process/preload.js'),
            worldSafeExecuteJavaScript: true
        },
        icon:path.join(__dirname, '../assets/img/fujitv.ico'),
        modal: true,
        show: false
    });
    window.setMenu(null);

    // XXX 開発ツールを有効化
    // window.webContents.openDevTools();

    window.loadURL(url.format({
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true
    }));

    window.once('ready-to-show', () => {
        window.show();
    });

    ['resize', 'move'].forEach(ev => {
        window.on(ev, () => {
            config.set('bounds', window.getBounds());
        });
    });

    epWindow.on('save', () => {
        const numOfApplicants = epWindow.value('numOfApplicants.numOfApplicants');
        config.set('numOfApplicants', numOfApplicants);
    });
    
    window.on('closed', () => {
        epWindow = null;
        window = null;
    });
}


/*
 * on ready
 */
app.on('ready', () => {
    createWindow();

    window.on('close', () => {
        app.quit();
    })
});


/*
 * on OPEN_PREFERENCES
 */
ipcMain.on('OPEN_PREFERENCES', (event, data) => {
    epWindow.show();
});
    

/*
 * on SEND
 */
ipcMain.on('SEND', (event, data) => {

    const changedNumOfApplicants = epWindow.value('numOfApplicants.numOfApplicants');
    const inputtedNumOfApplicants = epOptions.sections.length - 1;
    if (changedNumOfApplicants !== inputtedNumOfApplicants) {
        dialog.showMessageBoxSync(window, {
            type: 'error',
            title: '応募者人数エラー',
            message: '応募者人数を反映させるためにアプリを再起動してください'
        });
        window.webContents.send('STOPPED');
        return;
    }

    status.working = true;
    let {week} = data;
    let {keyword} = data;

    status.child = fork(require.resolve('../scripts/application.js'), [week, keyword, epOptions.dataStore], {});
    status.child.on('exit', (code, sig) => {
        window.webContents.send('DONE');
    });
    status.child.on('error', (error) => {
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
