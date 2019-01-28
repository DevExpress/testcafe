import Promise from 'pinkie';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import log from './log';
import promisifyEvent from 'promisify-event';
import dedent from 'dedent';


export default async function (testCafe, remoteCount, showQRCode) {
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

        const connectionUrl = testCafe.browserConnectionGateway.connectUrl;

        log.write(`Connect URL: ${chalk.underline.blue(connectionUrl)}`);

        if (showQRCode)
            qrcode.generate(connectionUrl);

        for (let i = 0; i < remoteCount; i++) {
            connectionPromises.push(testCafe
                .createBrowserConnection()
                .then(bc => promisifyEvent(bc, 'ready').then(() => bc))
                .then(bc => {
                    log.write(`${chalk.green('CONNECTED')} ${bc.userAgent}`);
                    return bc;
                })
            );
        }

        log.showSpinner();
    }

    return await Promise.all(connectionPromises);
}
