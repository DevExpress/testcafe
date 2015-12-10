import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import log from './log';
import promisifyEvent from 'promisify-event';

export default async function (testCafe, remoteCount, showQRCode) {
    var connections = [];

    if (remoteCount) {
        log.hideSpinner();

        for (var i = 0; i < remoteCount; i++) {
            var browserConnection = testCafe.createBrowserConnection();

            log.write(`To connect a remote browser #${i + 1}, use it to open ${chalk.underline.blue(browserConnection.url)}`);

            if (showQRCode) {
                log.write('or scan this QR-code:\n');
                qrcode.generate(browserConnection.url);
            }

            await promisifyEvent(browserConnection, 'ready');

            connections.push(browserConnection);
            log.write(`${chalk.green('CONNECTED')} ${browserConnection.userAgent}\n`);
        }

        log.showSpinner();
    }

    return connections;
}
