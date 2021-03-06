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

const confNumOfApplicants = config.get('numOfApplicants');
for (let i = 0; i < confNumOfApplicants; i++) {
    let applicantInfo = JSON.parse(JSON.stringify(applicantInfoTemplate));
    applicantInfo.id += (i + 1);
    applicantInfo.label += ' ' + (i + 1);
    applicantInfo.form.groups[0].label += ' ' + (i + 1);
    epOptions.sections.push(applicantInfo);
}
epWindow = new ElectronPreferences(epOptions);

// create 'numOfApplicants' key if not exists
if (!epWindow.value('numOfApplicants.numOfApplicants')) {
    epWindow.value('numOfApplicants.numOfApplicants', '1');
}


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
        title: '????????????????????????'
    };

    const applicantInfo1 = epWindow.value('applicantInfo1');
    if (!applicantInfo1) {
        errorResult.title = '?????????????????????????????????';
        errorResult.message = '??????????????????????????????????????????????????????';
        return errorResult;
    }

    const numOfApplicants = epWindow.value('numOfApplicants.numOfApplicants');
    for (let i = 0; i < numOfApplicants; i++) {
        const user = epWindow.value(`applicantInfo${(i + 1)}`);
        if (!user) {
            errorResult.message = `??????????????? ${(i + 1)}???????????????????????????`;

        } else if (!user.name) {
            errorResult.message = `??????????????? ${(i + 1)}???????????????????????????????????????`;
            
        } else if (!user.kana) {
            errorResult.message = `??????????????? ${(i + 1)}?????????????????????????????????????????????`;
            
        } else if (!user.age) {
            errorResult.message = `??????????????? ${(i + 1)}???????????????????????????????????????`;
            
        } else if (!user.gender) {
            errorResult.message = `??????????????? ${(i + 1)}???????????????????????????????????????`;
            
        } else if (!user.tel) {
            errorResult.message = `??????????????? ${(i + 1)}??????????????????????????????????????????????????????`;
            
        } else if (!user.zip) {
            errorResult.message = `??????????????? ${(i + 1)}?????????????????????????????????????????????`;
            
        } else if (!user.pref) {
            errorResult.message = `??????????????? ${(i + 1)}?????????????????????????????????????????????`;

        } else if (!user.address) {
            errorResult.message = `??????????????? ${(i + 1)}???????????????????????????????????????`;
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
            title: '????????????????????????',
            message: '?????????????????????????????????????????????????????????????????????????????????'
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
