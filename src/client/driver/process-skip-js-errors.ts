import { SkipJsErrorsOptions } from '../../configuration/interfaces';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import { isClientFunctionCommand } from '../../test-run/commands/utils';

export async function shouldSkipJsError (options: SkipJsErrorsOptions | boolean, err: any): Promise<boolean> {
    if (typeof options === 'boolean')
        return options;

    if (typeof options === 'object' && isClientFunctionCommand(options))
        return processJsErrorsFunction(options, err);

    if (typeof options === 'object')
        return processJsErrorsOptions(options, err);

    return false;
}

export function processJsErrorsOptions (options: SkipJsErrorsOptions, err: any): boolean {
    const { stack = '', pageUrl = '', message = '' } = options;

    const stackRegex   = new RegExp(stack);
    const pageUrlRegex = new RegExp(pageUrl);
    const messageRegex = new RegExp(message);

    return stackRegex.test(err.stack) && pageUrlRegex.test(err.pageUrl) && messageRegex.test(err.msg);
}

async function processJsErrorsFunction (processingFunction: any, err: any): Promise<boolean> {
    const opts: SkipJsErrorsOptions = {
        stack:   err.stack,
        pageUrl: err.pageUrl,
        message: err.msg,
    };

    processingFunction.args = [[opts]];

    const executor = new ClientFunctionExecutor(processingFunction);

    return executor.getResult();
}
