/*******************************
 * めざましじゃんけん応募
 *******************************/
const url = 'https://www.fujitv.co.jp/meza/d/index.html';
const puppeteer = require('puppeteer');
const USERS = require('./users.json');

/**
 * main
 */
const main = async (week, keyword) => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        defaultViewport: {
            width: 1000,
            height: 1200
        },
    });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: "domcontentloaded"});

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

        // await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});
        // await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});

        // await formPage.goBack({waitUntil: "domcontentloaded"});
        // await formPage.goBack({waitUntil: "domcontentloaded"});
    }

    await browser.close();
}

// コマンド実行
const week = process.argv[2];
const keyword = process.argv[3];
main(week, keyword);
