import chalk from 'chalk';
import { renderers } from 'callsite-record';
import renderCallsiteSync from '../utils/render-callsite-sync';
import createStackFilter from '../errors/create-stack-filter';

export default function showDeprecationMessage (callsite, info) {
    const callsiteStr = renderCallsiteSync(callsite, {
        renderer:    renderers.noColor,
        stackFilter: createStackFilter(Error.stackTraceLimit)
    });

    /* eslint-disable no-console */
    console.error(chalk.yellow('\n----'));
    console.error(chalk.yellow(`DEPRECATION-WARNING: ${info.what} was deprecated and will be removed in future releases.`));
    console.error(chalk.yellow(`Use ${info.useInstead} instead.`));
    console.error(chalk.yellow(`See https://devexpress.github.io/testcafe/documentation for more info.`));

    if (callsiteStr)
        console.error(chalk.yellow(callsiteStr));

    console.error(chalk.yellow('----\n'));
    /* eslint-enable no-console */
}
