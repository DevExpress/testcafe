import OS from 'os-family';
import Promise from 'pinkie';
import browserTools from 'testcafe-browser-tools';
import killBrowserProcess from '../../utils/kill-browser-process';
import delay from '../../../../utils/delay';


const MACOS_PROCESS_THROTTLING = 500;

var throttlingPromise = Promise.resolve();

function buildChromeArgs (config, cdpPort, platformArgs, profileDir) {
    return []
        .concat(
            [`--remote-debugging-port=${cdpPort}`],
            !config.userProfile ? [`--user-data-dir=${profileDir.name}`] : [],
            config.headless ? ['--headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir }) {
    var chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    var chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs(config, cdpPort, chromeOpenParameters.cmd, tempProfileDir);

    var currentThrottlingPromise = throttlingPromise;

    if (OS.mac)
        throttlingPromise = throttlingPromise.then(() => delay(MACOS_PROCESS_THROTTLING));

    await currentThrottlingPromise
        .then(() => browserTools.open(chromeOpenParameters, pageUrl));
}

export async function stop ({ browserId }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killBrowserProcess(browserId))
        await killBrowserProcess(browserId);
}
