import qrcode from 'qrcode-terminal';
import { Promise } from 'es6-promise';
import chalk from 'chalk';
import { getInstallations as getBrowserInstallations } from 'testcafe-browser-natives';
import CliArgumentParser from './argument-parser';
import createTestCafe from '../';

const ERR_PREFIX = chalk.red('ERROR ');

function exit (code) {
    // NOTE: give a process time to flush the output.
    // It's necessary in some environments.
    setTimeout(() => process.exit(code), 0);
}

function error (err) {
    var msg = err.message
        .split(/\n/g)
        .map(line => ERR_PREFIX + line)
        .join('\n');

    console.error(msg);
    console.error(chalk.gray('Type "tescafe -h" for help.'));

    exit(1);
}

function waitBrowserConnectionReady (browserConnection) {
    return new Promise(resolve => browserConnection.once('ready', resolve));
}

async function createRemoteBrowserConnections (testCafe, remoteCount, showQRCode) {
    var connections = [];

    // NOTE: add a blank line
    if (remoteCount)
        console.log();

    for (var i = 0; i < remoteCount; i++) {
        var browserConnection = testCafe.createBrowserConnection();

        console.log(`To connect remote browser #${i + 1} open ${chalk.underline.blue(browserConnection.url)}`);

        if (showQRCode) {
            console.log('or use this QR-code:\n');
            qrcode.generate(browserConnection.url);
        }

        await waitBrowserConnectionReady(browserConnection);

        connections.push(browserConnection);
        console.log(`${chalk.green('CONNECTED')} ${browserConnection.userAgent}\n`);
    }

    return connections;
}


async function runTests (argParser) {
    var opts           = argParser.opts;
    var port1          = opts.ports && opts.ports[0];
    var port2          = opts.ports && opts.ports[1];
    var testCafe       = await createTestCafe(opts.hostname, port1, port2);
    var remoteBrowsers = await createRemoteBrowserConnections(testCafe, argParser.remoteCount, opts.qrcode);
    var browsers       = argParser.browsers.concat(remoteBrowsers);
    var runner         = testCafe.createRunner();

    runner
        .src(argParser.src)
        .browsers(browsers)
        .reporter(opts.reporter, argParser.reportOutStream)
        .filter(argParser.filter)
        .screenshots(opts.screenshots, opts.screenshotsOnFails);

    var failed = await runner.run({
        skipJsErrors:   opts.skipJsErrors,
        quarantineMode: opts.quarantineMode
    });

    exit(failed);
}

async function listBrowsers () {
    var installations = await getBrowserInstallations();
    var aliases       = Object.keys(installations);

    console.log(aliases.join('\n'));
    exit(0);
}


(async function cli () {
    try {
        var argParser = new CliArgumentParser();

        await argParser.parse(process.argv);

        if (argParser.opts.listBrowsers)
            listBrowsers();
        else {
            console.log('Bootstrapping...');
            await runTests(argParser);
        }
    }
    catch (err) {
        error(err);
    }
})();

