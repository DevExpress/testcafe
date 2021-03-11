import chalk from 'chalk';
import { GeneralError, APIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import CliArgumentParser from './argument-parser';
import TerminationHandler from './termination-handler';
import log from './log';
import remotesWizard from './remotes-wizard';
import correctBrowsersAndSources from './correct-browsers-and-sources';
import createTestCafe from '../';

// NOTE: Load the provider pool lazily to reduce startup time
const lazyRequire         = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');

let showMessageOnExit = true;
let exitMessageShown  = false;
let exiting           = false;

function exitHandler (terminationLevel) {
    if (showMessageOnExit && !exitMessageShown) {
        exitMessageShown = true;

        log.write('Stopping TestCafe...');

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

    if (err instanceof GeneralError)
        message = err.message;

    else if (err instanceof APIError)
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
    const configFile        = opts.configFile;

    log.showSpinner();

    const { hostname, ssl, dev, experimentalCompilerService, retryTestPages, cache } = opts;

    const testCafe = await createTestCafe({
        developmentMode: dev,

        hostname,
        port1,
        port2,
        ssl,
        experimentalCompilerService,
        retryTestPages,
        cache,
        configFile
    });

    const correctedBrowsersAndSources = await correctBrowsersAndSources(argParser, testCafe.configuration);
    const automatedBrowsers           = correctedBrowsersAndSources.browsers;
    const remoteBrowsers              = await remotesWizard(testCafe, argParser.remoteCount, opts.qrCode);
    const browsers                    = automatedBrowsers.concat(remoteBrowsers);
    const sources                     = correctedBrowsersAndSources.sources;

    const runner = opts.live ? testCafe.createLiveModeRunner() : testCafe.createRunner();

    let failed = 0;

    runner.isCli = true;

    runner
        .useProxy(proxy, proxyBypass)
        .src(sources)
        .tsConfigPath(argParser.opts.tsConfigPath)
        .browsers(browsers)
        .reporter(argParser.opts.reporter)
        .concurrency(argParser.opts.concurrency)
        .filter(argParser.opts.filter)
        .video(opts.video, opts.videoOptions, opts.videoEncodingOptions)
        .screenshots(opts.screenshots)
        .startApp(opts.app, opts.appInitDelay)
        .clientScripts(argParser.opts.clientScripts)
        .compilerOptions(argParser.opts.compilerOptions);

    runner.once('done-bootstrapping', () => log.hideSpinner());

    try {
        const runOpts = argParser.getRunOptions();

        failed = await runner.run(runOpts);
    }

    finally {
        showMessageOnExit = false;
        await testCafe.close();
    }

    exit(failed);
}

async function listBrowsers (providerName) {
    const provider = await browserProviderPool.getProvider(providerName);

    if (!provider)
        throw new GeneralError(RUNTIME_ERRORS.browserProviderNotFound, providerName);

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

