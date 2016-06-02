import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import log from './log';
import promisifyEvent from 'promisify-event';
import dedent from 'dedent';

export default async function (testCafe, remoteCount, showQRCode) {
    var connections = [];

    if (remoteCount) {
        log.hideSpinner();

        var description = dedent(`
            Connecting ${remoteCount} remote browser(s)...
            Navigate to the appropriate URL from each of the remote browsers.
        `);

        log.write(description);

        if (showQRCode)
            log.write('You can either enter the URL or scan the QR-code.');

        for (var i = 0; i < remoteCount; i++) {
            var browserConnection = await testCafe.createBrowserConnection();

            log.write(`Browser #${i + 1}: ${chalk.underline.blue(browserConnection.url)}`);

            if (showQRCode)
                qrcode.generate(browserConnection.url);

            await promisifyEvent(browserConnection, 'ready');

            connections.push(browserConnection);
            log.write(`${chalk.green('CONNECTED')} ${browserConnection.userAgent}\n`);
        }

        log.showSpinner();
    }

    return connections;
}
