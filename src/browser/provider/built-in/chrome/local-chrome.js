import browserTools from 'testcafe-browser-tools';
import { findProcess, killProcess } from '../../../../utils/promisified-functions';


const BROWSER_CLOSING_TIMEOUT = 5;


function buildChromeArgs (config, cdpPort, platformArgs, userDataDir) {
    return [`--remote-debugging-port=${cdpPort}`, `--user-data-dir=${userDataDir.name}`]
        .concat(
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}

async function killChrome (cdpPort) {
    var chromeOptions = { arguments: `--remote-debugging-port=${cdpPort}` };
    var chromeProcess = await findProcess(chromeOptions);

    if (!chromeProcess.length)
        return true;

    try {
        await killProcess(chromeProcess[0].pid, { timeout: BROWSER_CLOSING_TIMEOUT });

        return true;
    }
    catch (e) {
        return false;
    }
}

export async function start (pageUrl, { browserName, config, cdpPort, tempUserDataDir }) {
    var chromeInfo = null;

    if (config.path)
        chromeInfo = await browserTools.getBrowserInfo(config.path);
    else
        chromeInfo = await browserTools.getBrowserInfo(browserName);

    var chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs(config, cdpPort, chromeOpenParameters.cmd, tempUserDataDir);

    await browserTools.open(chromeOpenParameters, pageUrl);
}

export async function stop ({ cdpPort }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killChrome(cdpPort))
        await killChrome(cdpPort);
}
