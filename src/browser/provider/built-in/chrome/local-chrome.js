import browserTools from 'testcafe-browser-tools';
import { findProcess, killProcess } from '../../../../utils/promisified-functions';


const BROWSER_CLOSING_TIMEOUT = 5;

function buildChromeArgs (config, cdpPort, platformArgs, profileDir) {
    return []
        .concat(
            config.headless || config.emulation ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${profileDir.name}`] : [],
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

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir }) {
    var chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    var chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs(config, cdpPort, chromeOpenParameters.cmd, tempProfileDir);

    await browserTools.open(chromeOpenParameters, pageUrl);
}

export async function stop ({ cdpPort }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killChrome(cdpPort))
        await killChrome(cdpPort);
}
