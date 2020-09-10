/**
 * This script is a wrapper around the scanyourpdf.com online tool to simulate a document scan
 * 
 * title: Scan
 * icon: %systemroot%\\system32\\imageres.dll,23
 * 
 */

const fs        = require('fs');
const path      = require('path');
const puppeteer = require('puppeteer');
const lib       = require('../libjs/lib');

if (process.argv.length < 3) return pressKeyToExit('Missing file argument');
if (process.argv[2].substr(-4).toLocaleLowerCase() != '.pdf') return pressKeyToExit(`File argument is not a pdf but a "${process.argv[2].substr(-4)}"`);
if (!fs.existsSync(process.argv[2])) return pressKeyToExit('File argument cannot be found on disk');

let fileToUpload = process.argv[2];
let downloadDir = path.dirname(fileToUpload);
let out_file_name = path.basename(fileToUpload, '.pdf') + '_scanned.pdf';

// const browser;

async function run() {
    // let launchOptions = { headless: false, args: ['--start-maximized'] };
    let launchOptions = {};
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage()
    
    // # GOTO PAGE
    await page.goto('https://www.scanyourpdf.com/')
    await page.setViewport({ width: 1366, height: 657 })
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    console.log('Went to online service page')
    
    // # UPLOAD DOCUMENT
    await page.waitForSelector('#form > div.image-upload-wrap > input[type=file]')
    await page.waitFor(700);
    const inputUploadHandle = await page.$('input[type=file]');
    inputUploadHandle.uploadFile(fileToUpload);
    console.log('File uploaded')
    
    // # RUN THE DOCUMENT SCAN SIMULATION
    await page.waitForSelector('#btn_upload')
    await page.waitFor(700);
    await page.click('#btn_upload')
    console.log('Downloading result...')
    
    // # DOWNLOAD DOCUMENT
    let link_doc_sel = 'body > main > div > div > div > div.file-upload.centrar > a';
    await page.waitForSelector(link_doc_sel)
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: downloadDir});
    await page.click(link_doc_sel)
    await page.waitFor(5000);

    // # RENAME DOCUMENT
    let link_href = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('body > main > div > div > div > div.file-upload.centrar > a'),
          a => a.getAttribute('href')
        )
    );
    let file_name = path.basename(link_href[0]);
    fs.renameSync(path.join(downloadDir, file_name), path.join(downloadDir, out_file_name))
    console.log('Done, closing browser\noutput file = ', out_file_name)

    
    await browser.close()
}



(async () => {
    try {
        run()
    } catch(e) {
        console.log(e)
        lib.pressKeyToExit('An error occurred')
    }
})()


