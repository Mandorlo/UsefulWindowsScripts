/**
 * title: to PDF
 * icon: %systemroot%\\system32\\imageres.dll,21
 * 
 */

const os        = require('os');
const fs        = require('fs');
const path      = require('path');
const moment    = require('moment');
const puppeteer = require('puppeteer');
const lib       = require('../libjs/lib');


// INIT VERIFICATIONS
if (process.argv.length < 3) return console.log('Missing file argument');
if (!/\.jpe?g$/.test(process.argv[2])) return console.log(`File argument is not a jpeg file but a "${process.argv[2].substr(-4)}"`);
if (!fs.existsSync(process.argv[2])) return console.log('File argument cannot be found on disk');

let fileToUpload = process.argv[2];
let downloadDir = path.dirname(path.resolve(fileToUpload));
let config_jpg2pdf_filepath = path.resolve(os.tmpdir(), 'config_jpg2pdf.json');

if (fs.existsSync(config_jpg2pdf_filepath)) {
    const stats = fs.statSync(config_jpg2pdf_filepath);
    console.log('config file exists', config_jpg2pdf_filepath, stats.mtime)
    if (moment(stats.mtime).isBefore(moment().subtract(20, 'minutes'))) return run();
    fs.writeFileSync(config_jpg2pdf_filepath, fileToUpload + '\n', {flag: 'a', encoding: 'utf8'})
} else {
    run()
}

async function run() {
    try {
        fs.unlinkSync(config_jpg2pdf_filepath)
    } catch(e) {
        console.log('cannot delete config file, looking for files to merge (3s)')
    }
    fs.writeFileSync(config_jpg2pdf_filepath, fileToUpload + '\n', {flag: 'a', encoding: 'utf8'})
    setTimeout(async _ => {
        let data = fs.readFileSync(config_jpg2pdf_filepath, 'utf8');
        let filesToUpload = data.split('\n').filter(el => el && true).sort()
        console.log('Files to merge :', filesToUpload)
        fs.unlinkSync(config_jpg2pdf_filepath)
        if (filesToUpload.length) await core(filesToUpload);
        return lib.pressKeyToExit('coucou')
    }, 2000)
}

async function core(filesToUpload) {

    let launchOptions = { headless: false, args: ['--start-maximized'] };
    // let launchOptions = {};
    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    const navigationPromise = page.waitForNavigation()
    
    // # GOTO ONLINE APP
    await page.goto('https://www.ilovepdf.com/fr/jpg_en_pdf')
    await page.setViewport({ width: 962, height: 657 })
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    console.log('On ilovepdf.com compression app')
    
    // # UPLOAD FILES
    await page.waitForSelector('#uploader > div > input[type=file]')
    await page.waitFor(700);
    const inputUploadHandle = await page.$('#uploader > div > input[type=file]');
    inputUploadHandle.uploadFile(...filesToUpload);
    console.log('Files uploaded')
    
    // # SELECT OPTIONS
    // format portrait
    await page.waitForSelector('#panel-options > .option__panel__content > ul.option__image > li[data-value=portrait]')
    await page.click('#panel-options > .option__panel__content > ul.option__image > li[data-value=portrait]')
    // size A4
    await page.waitForSelector('#pagesize')
    await page.select('#pagesize', 'A4')
    // margins 0
    await page.waitForSelector('#panel-options > div:nth-child(4) > ul.option__image > li[data-value="0"]')
    await page.click('#panel-options > div:nth-child(4) > ul.option__image > li[data-value="0"]')
    
    // PROCESS    
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: downloadDir});
    await page.waitForSelector('#processTask')
    await page.click('#processTask')
    console.log('running merge...')
    await navigationPromise
    while (await lib.checkSelector('#upload-status', page)) {
        let status = await page.evaluate((el) => document.querySelector('#upload-status > div.uploading__status__percent > div').innerText, page.$('#upload-status > div.uploading__status__percent > div'))
        console.log('running...', status)
        await page.waitFor(2000)
    }
    await page.waitForSelector('#pickfiles')
    t = 12000 
    console.log('Downloading document...', Math.round(t/1000), 's');
    await page.waitFor(t)

    
    await browser.close()
}