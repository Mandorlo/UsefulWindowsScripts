const fs        = require('fs');
const path      = require('path');
const puppeteer = require('puppeteer');
const lib       = require('../libjs/lib');

// INIT VERIFICATIONS
if (process.argv.length < 3) return lib.pressKeyToExit('Missing file argument');
if (process.argv[2].substr(-4).toLocaleLowerCase() != '.pdf') return lib.pressKeyToExit(`File argument is not a pdf but a "${process.argv[2].substr(-4)}"`);
if (!fs.existsSync(process.argv[2])) return lib.pressKeyToExit('File argument cannot be found on disk');

let fileToUpload = process.argv[2];
let downloadDir = path.dirname(path.resolve(fileToUpload));
console.log(downloadDir);

(async () => {
    // let launchOptions = { headless: false, args: ['--start-maximized'] };
    let launchOptions = {};
    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    
    const navigationPromise = page.waitForNavigation()
    
    // # GOTO ONLINE APP
    console.log('Connecting to ilovepdf.com...')
    await page.goto('https://www.ilovepdf.com/fr/compresser_pdf')
    await page.setViewport({ width: 1366, height: 657 })
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    console.log('On ilovepdf.com compression app')
    
    // # UPLOAD DOCUMENT
    await page.waitForSelector('#uploader > div > input[type=file]')
    await page.waitFor(700);
    const inputUploadHandle = await page.$('#uploader > div > input[type=file]');
    inputUploadHandle.uploadFile(fileToUpload);
    console.log('File uploaded')
    
    // # CHECK COMPRESSION OPTION
    await page.waitForSelector('#sidebar > #compress-options > .options > .option__select > .option--active')
    await page.click('#sidebar > #compress-options > .options > .option__select > .option--active')
    
    // # RUN
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: downloadDir});
    await page.waitForSelector('.toolpage #processTaskTextBtn')
    await page.click('.toolpage #processTaskTextBtn')
    await navigationPromise
    console.log('running compression...')
    while (await checkSelector('#upload-status', page)) {
        let status = await page.evaluate((el) => document.querySelector('#upload-status > div.uploading__status__percent > div').innerText, page.$('#upload-status > div.uploading__status__percent > div'))
        console.log('running...', status)
        await page.waitFor(2000)
    }
    await page.waitForSelector('#pickfiles')
    t = 12000 
    console.log('Downloading document...', Math.round(t/1000), 's');
    await page.waitFor(t)

    
    await browser.close()
})()

