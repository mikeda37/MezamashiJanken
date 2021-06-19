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
            width: 780,
            height: 830,
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

    // XXX enable dev tools
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


/**
 * validate applicants info
 * 
 * @return validation result
 */
const validateApplicantInfo = () => {

    const errorResult = {
        type: 'error',
        title: '応募者情報エラー'
    };

    const applicantInfo1 = epWindow.value('applicantInfo1');
    if (!applicantInfo1) {
        errorResult.title = '応募者情報未登録エラー';
        errorResult.message = '応募者情報を最低１人登録してください';
        return errorResult;
    }

    const numOfApplicants = epWindow.value('numOfApplicants.numOfApplicants');
    for (let i = 0; i < numOfApplicants; i++) {
        const user = epWindow.value(`applicantInfo${(i + 1)}`);
        if (!user) {
            errorResult.message = `応募者情報 ${(i + 1)}を登録してください`;

        } else if (!user.name) {
            errorResult.message = `応募者情報 ${(i + 1)}（氏名）を登録してください`;
            
        } else if (!user.kana) {
            errorResult.message = `応募者情報 ${(i + 1)}（フリガナ）を登録してください`;
            
        } else if (!user.age) {
            errorResult.message = `応募者情報 ${(i + 1)}（年代）を登録してください`;
            
        } else if (!user.gender) {
            errorResult.message = `応募者情報 ${(i + 1)}（性別）を登録してください`;
            
        } else if (!user.tel) {
            errorResult.message = `応募者情報 ${(i + 1)}（連絡先電話番号）を登録してください`;
            
        } else if (!user.zip) {
            errorResult.message = `応募者情報 ${(i + 1)}（郵便番号）を登録してください`;
            
        } else if (!user.pref) {
            errorResult.message = `応募者情報 ${(i + 1)}（都道府県）を登録してください`;

        } else if (!user.address) {
            errorResult.message = `応募者情報 ${(i + 1)}（住所）を登録してください`;
        }
        if (errorResult.message) {
            return errorResult;
        }
    }

    return {type: 'OK'};
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

    const loadedNumOfApplicants = epOptions.sections.length - 1;
    const changedNumOfApplicants = epWindow.value('numOfApplicants.numOfApplicants');
    if (loadedNumOfApplicants !== changedNumOfApplicants) {
        dialog.showMessageBoxSync(window, {
            type: 'error',
            title: '応募者人数エラー',
            message: '応募者人数を反映させるためにアプリを再起動してください'
        });
        window.webContents.send('STOPPED');
        return;
    }

    // validate applicants info
    const result = validateApplicantInfo();
    if (result.type === 'error') {
        dialog.showMessageBoxSync(window, {
            type: 'error',
            title: result.title,
            message: result.message
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
