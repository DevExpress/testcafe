import Promise from 'pinkie';
import { partition } from 'lodash';
import OPTION_NAMES from '../configuration/option-names';
import { CompositeError } from '../errors/runtime';

// NOTE: Load the provider pool lazily to reduce startup time
const lazyRequire         = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');


async function getBrowserInfo (browser) {
    try {
        return {
            error: null,
            info:  await browserProviderPool.getBrowserInfo(browser)
        };
    }
    catch (err) {
        return {
            error: err,
            info:  null
        };
    }
}

export default async function (args, configuration) {
    const browsersOption = configuration.getOption(OPTION_NAMES.browsers);

    if (!args.browsers || !args.browsers.length)
        return { browsers: [], sources: args.src };

    if (!browsersOption || !browsersOption.length)
        return { browsers: args.browsers, sources: args.src };

    const browserInfo              = await Promise.all(args.browsers.map(browser => getBrowserInfo(browser)));
    const [parsedInfo, failedInfo] = partition(browserInfo, info => !info.error);

    if (parsedInfo.length === browserInfo.length)
        return { browsers: args.browsers, sources: args.src };

    if (!parsedInfo.length)
        return { browsers: [], sources: [args.args[0], ...args.src] };

    throw new CompositeError(failedInfo.map(info => info.error));
}
