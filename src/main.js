const {app, Menu, BrowserWindow} = require('electron');
const pie = require('puppeteer-in-electron');
const puppeteer = require('puppeteer-core');
const path = require('path');
const url = require('url');
const janken = require('./janken.js');

let browser = null;
let page = null;
let mainWindow = null;

/**
 * connect puppeteer
 */
const connectPuppeteer = async () => {
    await console.log('◆initialize \n');
    await pie.initialize(app);
    browser = await pie.connect(app, puppeteer);
    await console.log('◆1.browser= 【' + browser + '】\n');
};


/**
 * create window
 */
const createWindow = async () => {

    mainWindow = new BrowserWindow({
        x: 10,
        y: 10,
        width: 800,
        height: 600,
        webPreferences: {
            preload: `${__dirname}/preload.js`,
            enableRemoteModule: true
        },
        // 'icon': __dirname + '/shimarin.ico'

        modal: true,
        parent: mainWindow
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // 開発ツールを有効化
    // mainWindow.webContents.openDevTools();

    await console.log('◆2.browser= [' + browser + ']\n');
    
    // ページを表示する
    page = await pie.getPage(browser, mainWindow);
    
    let keyword = '555';
    await janken.main(browser, page, keyword);
  

    // Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


(async () => {
    await connectPuppeteer();
    await createWindow();
})();


app.on('ready', () => {
    // createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
