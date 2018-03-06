import fs from 'fs';
import chalk from 'chalk';
import browserProviderPool from '../browser/provider/pool';
import { GeneralError, APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import CliArgumentParser from './argument-parser';
import TerminationHandler from './termination-handler';
import log from './log';
import remotesWizard from './remotes-wizard';
import createTestCafe from '../';


var showMessageOnExit = true;
var exitMessageShown  = false;
var exiting           = false;

function exitHandler (terminationLevel) {
    if (showMessageOnExit && !exitMessageShown) {
        exitMessageShown = true;

        log.hideSpinner();
        log.write('Stopping TestCafe...');
        log.showSpinner();

        process.on('exit', () => log.hideSpinner(true));
    }

    if (exiting || terminationLevel < 2)
        return;

    exiting = true;

    exit(0);
}

function exit (code) {
    log.hideSpinner(true);

    // NOTE: give a process time to flush the output.
    // It's necessary in some environments.
    setTimeout(() => process.exit(code), 0);
}

function error (err) {
    log.hideSpinner();

    var message = null;

    // HACK: workaround for the `instanceof` problem
    // (see: http://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node)
    if (err.constructor === GeneralError)
        message = err.message;

    else if (err.constructor === APIError)
        message = err.coloredStack;

    else
        message = err.stack;

    log.write(chalk.red('ERROR ') + message + '\n');
    log.write(chalk.gray('Type "testcafe -h" for help.'));

    exit(1);
}

async function runTests (argParser) {
    var opts              = argParser.opts;
    var port1             = opts.ports && opts.ports[0];
    var port2             = opts.ports && opts.ports[1];
    var externalProxyHost = opts.proxy;
    var proxyBypass       = opts.proxyBypass;

    log.showSpinner();

    var testCafe       = await createTestCafe(opts.hostname, port1, port2);
    var concurrency    = argParser.concurrency || 1;
    var remoteBrowsers = await remotesWizard(testCafe, argParser.remoteCount, opts.qrCode);
    var browsers       = argParser.browsers.concat(remoteBrowsers);
    var runner         = testCafe.createRunner();
    var failed         = 0;
    var reporters      = argParser.opts.reporters.map(r => {
        return {
            name:      r.name,
            outStream: r.outFile ? fs.createWriteStream(r.outFile) : void 0
        };
    });

    reporters.forEach(r => runner.reporter(r.name, r.outStream));

    runner
        .useProxy(externalProxyHost, proxyBypass)
        .src(argParser.src)
        .browsers(browsers)
        .concurrency(concurrency)
        .filter(argParser.filter)
        .screenshots(opts.screenshots, opts.screenshotsOnFails)
        .startApp(opts.app, opts.appInitDelay);

    runner.once('done-bootstrapping', () => log.hideSpinner());

    try {
        failed = await runner.run(opts);
    }

    finally {
        showMessageOnExit = false;
        await testCafe.close();
    }

    exit(failed);
}

async function listBrowsers (providerName = 'locally-installed') {
    var provider = await browserProviderPool.getProvider(providerName);

    if (!provider)
        throw new GeneralError(MESSAGE.browserProviderNotFound, providerName);

    if (provider.isMultiBrowser) {
        var browserNames = await provider.getBrowserList();

        await browserProviderPool.dispose();

        if (providerName === 'locally-installed')
            console.log(browserNames.join('\n'));
        else
            console.log(browserNames.map(browserName => `"${providerName}:${browserName}"`).join('\n'));
    }
    else
        console.log(`"${providerName}"`);

    exit(0);
}

(async function cli () {
    var terminationHandler = new TerminationHandler();

    terminationHandler.on(TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT, exitHandler);

    try {
        var argParser = new CliArgumentParser();

        await argParser.parse(process.argv);

        if (argParser.opts.listBrowsers)
            await listBrowsers(argParser.opts.providerName);
        else
            await runTests(argParser);
    }
    catch (err) {
        showMessageOnExit = false;
        error(err);
    }
})();

