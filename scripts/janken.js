/*******************************
 * めざましじゃんけん応募
 *******************************/
const url = 'https://www.fujitv.co.jp/meza/d/index.html';
const puppeteer = require('puppeteer');
const USERS = require('./users.json');
const log = require('electron-log');

log.transports.file.file = 'logs/log.log';

/**
 * main
 */
const main = async (week, keyword) => {
    
    log.info('◆week= 【' + week + '】\n');
    log.info('◆keyword= 【' + keyword + '】\n');
    
    const args = [
        '--window-position=0,0',
        '--window-size=1000,1200',
    ];
    const browser = await puppeteer.launch({
        args,
        executablePath: puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'),
        headless: false,
        slowMo: 50,
    });

    const page = await browser.newPage();
    // viewportをフルサイズにする
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    page.setViewport({
        width: 1200,
        height: 1300
    });

    await page.goto(url, {waitUntil: "domcontentloaded"});

    // ポップアップページ用処理
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    
    switch (week) {
        case 'this':
            // 今週分
            await page.click('#currentweek .btn01 > a', {waitUntil: "domcontentloaded"});
            break;
        case 'last':
            // 先週分
            await page.click('#lastweek .btn01 > a', {waitUntil: "domcontentloaded"});
            break;
    }

    const formPage = await newPagePromise;
    
    // viewportをフルサイズにする
    await formPage._client.send('Emulation.clearDeviceMetricsOverride');

    for (user of USERS) {
        await formPage.$eval('input[name="DATA1"]', (el, val) => {el.value = val}, keyword);
        await formPage.$eval('input[name="KJNAME1"]', (el, val) => {el.value = val}, user.name);
        await formPage.$eval('input[name="KNNAME1"]', (el, val) => {el.value = val}, user.kana);
        await formPage.select('select[name="AGE"]', user.age);
        await formPage.click('input[name="GENDER"][value="' + user.gender + '"]');
        await formPage.$eval('input[name="TEL1"]', (el, val) => {el.value = val}, user.tel);
        await formPage.$eval('input[name="ZIP"]', (el, val) => {el.value = val}, user.zip);
        await formPage.select('select[name="PREF"]', user.pref);
        await formPage.$eval('input[name="ADDR1"]', (el, val) => {el.value = val}, user.address);

        await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});
        await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});

        await formPage.goBack({waitUntil: "domcontentloaded"});
        await formPage.goBack({waitUntil: "domcontentloaded"});
    }

    await browser.close();
}

// コマンド実行
const week = process.argv[2];
const keyword = process.argv[3];
main(week, keyword);
