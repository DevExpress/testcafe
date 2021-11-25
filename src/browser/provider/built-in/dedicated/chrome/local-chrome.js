import browserTools from 'testcafe-browser-tools';
import { killBrowserProcess } from '../../../../../utils/process';
import BrowserStarter from '../../../utils/browser-starter';
import { buildChromeArgs } from './build-chrome-args';
import remoteChrome from 'chrome-remote-interface';

const browserStarter = new BrowserStarter();

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir, inDocker }) {
    const chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    const chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs({ config, cdpPort, platformArgs: chromeOpenParameters.cmd, tempProfileDir, inDocker });

    await browserStarter.startBrowser(chromeOpenParameters, pageUrl);
}

export async function startOnDocker (pageUrl, { browserName, config, cdpPort, tempProfileDir, inDocker }) {
    await start('', { browserName, config, cdpPort, tempProfileDir, inDocker });
    await new Promise(resolve => setTimeout(() => resolve(), 500));

    const tabs       = await remoteChrome.List({ port: cdpPort });
    const target     = tabs.filter(t => t.type === 'page')[0];
    const { Target } = await remoteChrome({ target, port: cdpPort });

    await Target.createTarget({ url: pageUrl });
}

export async function stop ({ browserId }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killBrowserProcess(browserId))
        await killBrowserProcess(browserId);
}
