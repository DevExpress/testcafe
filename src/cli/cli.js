import chalk from 'chalk';
import { GeneralError, APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import CliArgumentParser from './argument-parser';
import TerminationHandler from './termination-handler';
import log from './log';
import remotesWizard from './remotes-wizard';
import createTestCafe from '../';

let showMessageOnExit = true;
let exitMessageShown  = false;
let exiting           = false;

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

    let message = null;

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
    const opts              = argParser.opts;
    const port1             = opts.ports && opts.ports[0];
    const port2             = opts.ports && opts.ports[1];
    const proxy             = opts.proxy;
    const proxyBypass       = opts.proxyBypass;

    log.showSpinner();

    const testCafe       = await createTestCafe(opts.hostname, port1, port2, opts.ssl, opts.dev);
    const remoteBrowsers = await remotesWizard(testCafe, argParser.remoteCount, opts.qrCode);
    const browsers       = argParser.browsers.concat(remoteBrowsers);
    const runner         = opts.live ? testCafe.createLiveModeRunner() : testCafe.createRunner();

    let failed = 0;


    runner.isCli = true;

    runner
        .useProxy(proxy, proxyBypass)
        .src(argParser.src)
        .browsers(browsers)
        .reporter(argParser.opts.reporter)
        .concurrency(argParser.opts.concurrency)
        .filter(argParser.filter)
        .video(opts.video, opts.videoOptions, opts.videoEncodingOptions)
        .screenshots(opts.screenshots, opts.screenshotsOnFails, opts.screenshotPathPattern)
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
    // NOTE: Load the provider pool lazily to reduce startup time
    const browserProviderPool = require('../browser/provider/pool');

    const provider = await browserProviderPool.getProvider(providerName);

    if (!provider)
        throw new GeneralError(MESSAGE.browserProviderNotFound, providerName);

    if (provider.isMultiBrowser) {
        const browserNames = await provider.getBrowserList();

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
    const terminationHandler = new TerminationHandler();

    terminationHandler.on(TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT, exitHandler);

    try {
        const argParser = new CliArgumentParser();

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

