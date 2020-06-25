/*******************************
 * めざましじゃんけん応募
 *******************************/
const url = 'https://www.fujitv.co.jp/meza/d/index.html';
// const puppeteer = require('puppeteer');
const members = require('../members.json');

// document.querySelector('#btn-send').addEventListener('click', () => {
// 	const keyword = document.getElementById('input-field').value;
// 	// console.log('◆keyword= 【' + keyword + '】\n');
// 	main(keyword);
// });

/**
 * main
 */
 const main = async (browser, page, keyword) => {
    // const browser = await puppeteer.launch({
    //     headless: false,
    //     slowMo: 50,
    //     defaultViewport: {
    //         width: 1000,
    //         height: 1100
    //     },
    // });

    // const page = await browser.newPage();
    
    await page.goto(url, {waitUntil: "domcontentloaded"});
    
    // 今週分
    // await page.click('#currentweek .btn01 > a', {waitUntil: "domcontentloaded"});
    // 先週分
    // await page.click('#lastweek .btn01 > a', {waitUntil: "domcontentloaded"});
    
    
    const promises = await Promise.all([
        new Promise(resolve =>
            browser.once("targetcreated", target => resolve(target.page()))
            ),
        // 今週分
        page.click('#currentweek .btn01 > a')
      ]);
    const formPage = promises[0];


    // const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    // const popup = await newPagePromise;
    // var pages = await browser.pages();
    // var formPage = await pages[pages.length - 1];
    
    // await console.log('◆pages.length= 【' + pages.length + '】\n');
    
    await console.log('◆formPage= 【' + formPage + '】\n');
    
    // await formPage.waitForSelector('html');
    await formPage.goto('https://www.yahoo.co.jp/');

    // await console.log('◆pages.length= 【' + pages.length + '】\n');


    for (member of members) {
        await formPage.$eval('input[name="DATA1"]', (el, val) => {el.value = val}, keyword);
        await formPage.$eval('input[name="KJNAME1"]', (el, val) => {el.value = val}, member.name);
        await formPage.$eval('input[name="KNNAME1"]', (el, val) => {el.value = val}, member.kana);
        await formPage.select('select[name="AGE"]', member.age);
        await formPage.click('input[name="GENDER"][value="' + member.gender + '"]');
        await formPage.$eval('input[name="TEL1"]', (el, val) => {el.value = val}, member.tel);
        await formPage.$eval('input[name="ZIP"]', (el, val) => {el.value = val}, member.zip);
        await formPage.select('select[name="PREF"]', member.pref);
        await formPage.$eval('input[name="ADDR1"]', (el, val) => {el.value = val}, member.address);

        // await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});
        // await formPage.click('input[type="submit"]', {waitUntil: "domcontentloaded"});

        // await formPage.goBack({waitUntil: "domcontentloaded"});
        // await formPage.goBack({waitUntil: "domcontentloaded"});
    }

    await browser.close();
}

module.exports.main = main;
