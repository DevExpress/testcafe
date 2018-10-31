import browserTools from 'testcafe-browser-tools';
import { killBrowserProcess } from '../../../../utils/process';
import BrowserStarter from '../../utils/browser-starter';


const browserStarter = new BrowserStarter();

function buildChromeArgs (config, cdpPort, platformArgs, profileDir) {
    return []
        .concat(
            cdpPort ? [`--remote-debugging-port=${cdpPort}`] : [],
            !config.userProfile ? [`--user-data-dir=${profileDir.path}`] : [],
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir }) {
    const chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    const chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs(config, cdpPort, chromeOpenParameters.cmd, tempProfileDir);

    await browserStarter.startBrowser(chromeOpenParameters, pageUrl);
}

export async function stop ({ browserId }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killBrowserProcess(browserId))
        await killBrowserProcess(browserId);
}
