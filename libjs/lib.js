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