import browserTools from 'testcafe-browser-tools';
import { killBrowserProcess } from '../../../../../utils/process';
import BrowserStarter from '../../../utils/browser-starter';
import { buildChromeArgs } from './build-chrome-args';
import remoteChrome from 'chrome-remote-interface';
import Timer from '../../../../../utils/timer';
import delay from '../../../../../utils/delay';

const browserStarter = new BrowserStarter();

const LIST_TABS_TIMEOUT = 10000;
const LIST_TABS_DELAY   = 500;

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir, isContainerized, isNativeAutomation }) {
    const chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    const chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs({ config, cdpPort, platformArgs: chromeOpenParameters.cmd, tempProfileDir, isContainerized, isNativeAutomation, browserName });

    await browserStarter.startBrowser(chromeOpenParameters, pageUrl);
}

async function tryListTabs (cdpPort) {
    try {
        return { tabs: await remoteChrome.List({ port: cdpPort }) };
    }
    catch (error) {
        return { error };
    }
}

export async function startOnDocker (pageUrl, { browserName, config, cdpPort, tempProfileDir, isContainerized }) {
    await start('', { browserName, config, cdpPort, tempProfileDir, isContainerized });

    let { tabs, error } = await tryListTabs(cdpPort);
    const timer         = new Timer(LIST_TABS_TIMEOUT);

    //NOTE: We should repeat getting 'List' after a while because we can get an error if the browser isn't ready.
    while ((error || !tabs.length) && !timer.expired) {
        await delay(LIST_TABS_DELAY);

        ({ tabs, error } = await tryListTabs(cdpPort));
    }

    if (error)
        throw error;

    const target     = tabs.filter(t => t.type === 'page')[0];
    const { Target } = await remoteChrome({ target, port: cdpPort });

    await Target.createTarget({ url: pageUrl });
    await remoteChrome.Close({ id: target.id, port: cdpPort });
}

export async function stop ({ browserId }) {
    // NOTE: Chrome on Linux closes only after the second SIGTERM signall
    if (!await killBrowserProcess(browserId))
        await killBrowserProcess(browserId);
}
