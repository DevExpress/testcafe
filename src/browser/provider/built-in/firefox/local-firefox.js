import browserTools from 'testcafe-browser-tools';


function buildFirefoxArgs (config, platformArgs, profileDir) {
    return []
        .concat(
            !config.userProfile ? ['-no-remote', '-new-instance', `-profile "${profileDir.name}"`] : [],
            config.headless ? ['-marionette', '-headless'] : [],
            config.userArgs ? [config.userArgs] : [],
            platformArgs ? [platformArgs] : []
        )
        .join(' ');
}


export async function start (pageUrl, { browserName, config, tempProfileDir }) {
    var firefoxInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    var firefoxOpenParameters = Object.assign({}, firefoxInfo);

    firefoxOpenParameters.cmd = buildFirefoxArgs(config, firefoxOpenParameters.cmd, tempProfileDir);

    await browserTools.open(firefoxOpenParameters, pageUrl);
}
