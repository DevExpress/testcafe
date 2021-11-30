import browserTools from 'testcafe-browser-tools';
import { killBrowserProcess } from '../../../../../utils/process';
import BrowserStarter from '../../../utils/browser-starter';
import { buildChromeArgs } from './build-chrome-args';
import remoteChrome from 'chrome-remote-interface';
import timeLimit from 'time-limit-promise';

const browserStarter = new BrowserStarter();

export async function start (pageUrl, { browserName, config, cdpPort, tempProfileDir, inDocker }) {
    const chromeInfo           = await browserTools.getBrowserInfo(config.path || browserName);
    const chromeOpenParameters = Object.assign({}, chromeInfo);

    chromeOpenParameters.cmd = buildChromeArgs({ config, cdpPort, platformArgs: chromeOpenParameters.cmd, tempProfileDir, inDocker });

    await browserStarter.startBrowser(chromeOpenParameters, pageUrl);
}

export async function startOnDocker (pageUrl, { browserName, config, cdpPort, tempProfileDir, inDocker }) {
    await start('', { browserName, config, cdpPort, tempProfileDir, inDocker });
    const error = new Error();

    //NOTE: We should repeat getting 'List' after a while because we can get an error if the browser isn't ready.
    const promise = new Promise(resolve => {
        async function getTabs () {
            try {
                resolve(await remoteChrome.List({ port: cdpPort }));
            }
            catch (e) {
                error.message = e.message;
                setTimeout(() => getTabs(), 500);
            }
        }

        getTabs();
    });

    const tabs       = await timeLimit(promise, 5000, { rejectWith: error });
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
