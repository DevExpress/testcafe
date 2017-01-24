import chalk from 'chalk';
import createStackFilter from '../errors/create-stack-filter';

export default function showDebuggerMessage (callsite, userAgent) {
    var callsiteStr = callsite.renderSync({
        frameSize:   1,
        stackFilter: createStackFilter(Error.stackTraceLimit),
        stack:       false
    });

    /* eslint-disable no-console */
    console.error('\n----');
    console.error(userAgent);
    console.error(chalk.yellow('DEBUGGER PAUSE:'));
    console.error(callsiteStr);
    console.error('----\n');
    /* eslint-enable no-console */
}
