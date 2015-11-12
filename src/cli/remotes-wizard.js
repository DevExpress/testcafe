import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import spinner from './spinner';
import { Promise } from 'es6-promise';

function waitBrowserConnectionReady (browserConnection) {
    return new Promise(resolve => browserConnection.once('ready', resolve));
}

export default async function (testCafe, remoteCount, showQRCode) {
    var connections = [];

    if (remoteCount) {
        spinner.hide();

        for (var i = 0; i < remoteCount; i++) {
            var browserConnection = testCafe.createBrowserConnection();

            console.log(`To connect a remote browser #${i + 1}, use it to open ${chalk.underline.blue(browserConnection.url)}`);

            if (showQRCode) {
                console.log('or scan this QR-code:\n');
                qrcode.generate(browserConnection.url);
            }

            await waitBrowserConnectionReady(browserConnection);

            connections.push(browserConnection);
            console.log(`${chalk.green('CONNECTED')} ${browserConnection.userAgent}\n`);
        }

        spinner.showBootstrapIndicator();
    }

    return connections;
}
