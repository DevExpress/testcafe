import chalk from 'chalk';
import resolveCwd from 'resolve-cwd';
import browserProviderPool from '../browser/provider/pool';
import { GeneralError, APIError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import CliArgumentParser from './argument-parser';
import log from './log';
import remotesWizard from './remotes-wizard';
import createTestCafe from '../';

function exit (code) {
    log.hideSpinner();

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
    var opts  = argParser.opts;
    var port1 = opts.ports && opts.ports[0];
    var port2 = opts.ports && opts.ports[1];

    log.showSpinner();

    var testCafe       = await createTestCafe(opts.hostname, port1, port2);
    var remoteBrowsers = await remotesWizard(testCafe, argParser.remoteCount, opts.qrCode);
    var browsers       = argParser.browsers.concat(remoteBrowsers);
    var runner         = testCafe.createRunner();
    var failed         = 0;

    runner
        .src(argParser.src)
        .browsers(browsers)
        .reporter(opts.reporter)
        .filter(argParser.filter)
        .screenshots(opts.screenshots, opts.screenshotsOnFails);

    runner.once('done-bootstrapping', () => log.hideSpinner());

    try {
        failed = await runner.run({
            skipJsErrors:    opts.skipJsErrors,
            quarantineMode:  opts.quarantineMode,
            selectorTimeout: opts.selectorTimeout,
            speed:           opts.speed,
            touchMode:       opts.touchMode
        });
    }

    finally {
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

function useLocalInstallation () {
    var local = resolveCwd('testcafe/lib/cli');

    if (local && local !== __filename) {
        log.write('Using locally installed version of TestCafe.');
        require(local);
        return true;
    }

    return false;
}


(async function cli () {
    if (useLocalInstallation())
        return;

    try {
        var argParser = new CliArgumentParser();

        await argParser.parse(process.argv);

        if (argParser.opts.listBrowsers)
            await listBrowsers(argParser.opts.providerName);
        else
            await runTests(argParser);
    }
    catch (err) {
        error(err);
    }
})();

