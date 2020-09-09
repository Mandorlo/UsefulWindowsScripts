const fs = require('fs')


exports.pressKeyToExit = (msg = '') => {
    if (msg != '') console.log(msg);
    console.log('Press any key to exit');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

exports.checkSelector = async (s, page) => {
    return page.evaluate((sel) => document.querySelector(sel) && true, s)
}

exports.waitForFile = async (path, timeout = 30000) => {
    let aux = async (path, timeout) => {
        if (timeout > 0 && !fs.existsSync(path)) {
            await wait(500)
            return aux(path, timeout - 500)
        } else {
            return timeout > 0;
        }
    }
    return aux(path, timeout)
}

async function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(_ => resolve(true), ms)
    })
}
exports.Wait = wait