import OS from 'os-family';
import browserTools from 'testcafe-browser-tools';
import { killBrowserProcess } from '../../../../../utils/process';
import BrowserStarter from '../../../utils/browser-starter';


const browserStarter = new BrowserStarter();

function correctOpenParametersForMac (parameters) {
    parameters.macOpenCmdTemplate = parameters.macOpenCmdTemplate
        .replace('open', 'open -n')
        .replace(' {{{pageUrl}}}', '');

    parameters.macOpenCmdTemplate += ' {{{pageUrl}}}';
}

function buildFirefoxArgs (config, platformArgs, { marionettePort, tempProfileDir }) {
    return []
        .concat(
            marionettePort ? ['-marionette'] : [],
            !config.userProfile ? ['-no-remote', '-new-instance', `-profile "${tempProfileDir.path}"`] : [],
            config.headless ? ['-headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}

export async function start (pageUrl, runtimeInfo) {
    const { browserName, config } = runtimeInfo;

    const firefoxInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    const firefoxOpenParameters = Object.assign({}, firefoxInfo);

    if (OS.mac && !config.userProfile)
        correctOpenParametersForMac(firefoxOpenParameters);

    firefoxOpenParameters.cmd = buildFirefoxArgs(config, firefoxOpenParameters.cmd, runtimeInfo, runtimeInfo.newInstance);

    await browserStarter.startBrowser(firefoxOpenParameters, pageUrl);
}

export async function stop ({ browserId }) {
    await killBrowserProcess(browserId);
}
