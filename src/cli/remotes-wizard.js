import Promise from 'pinkie';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import log from './log';
import promisifyEvent from 'promisify-event';
import dedent from 'dedent';


export default async function (testCafe, remoteCount, showQRCode) {
    var connectionPromises = [];

    if (remoteCount) {
        log.hideSpinner();

        var description = dedent(`
            Connecting ${remoteCount} remote browser(s)...
            Navigate to the following URL from each remote browser.
        `);

        log.write(description);

        if (showQRCode)
            log.write('You can either enter the URL or scan the QR-code.');

        var connectionUrl = testCafe.browserConnectionGateway.connectUrl;

        log.write(`Connect URL: ${chalk.underline.blue(connectionUrl)}`);

        if (showQRCode)
            qrcode.generate(connectionUrl);

        for (var i = 0; i < remoteCount; i++) {
            connectionPromises.push(testCafe
                .createBrowserConnection()
                .then(bc => promisifyEvent(bc, 'ready').then(() => bc))
                .then(bc => {
                    log.hideSpinner();
                    log.write(`${chalk.green('CONNECTED')} ${bc.userAgent}`);
                    log.showSpinner();
                    return bc;
                })
            );
        }

        log.showSpinner();
    }

    return await Promise.all(connectionPromises);
}
