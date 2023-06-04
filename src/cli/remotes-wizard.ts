import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import log from './log';
import promisifyEvent from 'promisify-event';
import dedent from 'dedent';

import BrowserConnection from '../browser/connection';
import BrowserConnectionGateway from '../browser/connection/gateway';
import TestCafeConfiguration from '../configuration/testcafe-configuration';

interface TestCafe {
    browserConnectionGateway: BrowserConnectionGateway;
    createBrowserConnection(): Promise<BrowserConnection>;
    initializeBrowserConnectionGateway(): Promise<void>;
    configuration: TestCafeConfiguration;
}

export default async function (testCafe: TestCafe, remoteCount: number, showQRCode: boolean): Promise<BrowserConnection[]> {
    const connectionPromises = [];

    if (remoteCount) {
        log.hideSpinner();

        const description = dedent(`
            Connecting ${remoteCount} remote browser(s)...
            Navigate to the following URL from each remote browser.
        `);

        log.write(description);

        if (showQRCode)
            log.write('You can either enter the URL or scan the QR-code.');

        // NOTE: 'remote' browser connection cannot be in the 'native automation' mode.
        testCafe.configuration.mergeOptions({ disableNativeAutomation: true });

        await testCafe.initializeBrowserConnectionGateway();

        const connectionUrl = testCafe.browserConnectionGateway.connectUrl;

        log.write(`Connect URL: ${chalk.underline.blue(connectionUrl)}`);

        if (showQRCode)
            qrcode.generate(connectionUrl);

        for (let i = 0; i < remoteCount; i++) {
            connectionPromises.push(testCafe
                .createBrowserConnection()
                .then((bc: BrowserConnection) => promisifyEvent(bc, 'ready').then(() => bc))
                .then((bc: BrowserConnection) => {
                    log.write(`${chalk.green('CONNECTED')} ${bc.userAgent}`);

                    return bc;
                })
            );
        }

        log.showSpinner();
    }

    return await Promise.all(connectionPromises);
}
