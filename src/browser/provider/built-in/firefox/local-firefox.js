import OS from 'os-family';
import browserTools from 'testcafe-browser-tools';
import killBrowserProcess from '../../utils/kill-browser-process';


function correctOpenParametersForMac (parameters) {
    parameters.macOpenCmdTemplate = parameters.macOpenCmdTemplate
        .replace('open', 'open -n')
        .replace(' {{{pageUrl}}}', '');

    parameters.macOpenCmdTemplate += ' {{{pageUrl}}}';
}

function buildFirefoxArgs (config, platformArgs, profileDir) {
    return []
        .concat(
            !config.userProfile ? ['-no-remote', '-new-instance', `-profile "${profileDir.name}"`] : [],
            ['-marionette', '-headless'],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}

export async function start (pageUrl, runtimeInfo) {
    var { browserName, config, tempProfileDir } = runtimeInfo;
    var firefoxInfo                             = await browserTools.getBrowserInfo(config.path || browserName);
    var firefoxOpenParameters                   = Object.assign({}, firefoxInfo);

    if (OS.mac && !config.userProfile)
        correctOpenParametersForMac(firefoxOpenParameters);

    firefoxOpenParameters.cmd = buildFirefoxArgs(config, firefoxOpenParameters.cmd, tempProfileDir, runtimeInfo.newInstance);

    await browserTools.open(firefoxOpenParameters, pageUrl);
}

export async function stop ({ browserId }) {
    await killBrowserProcess(browserId);
}
