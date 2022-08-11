import { Dictionary, SkipJsErrorsOptions } from '../../configuration/interfaces';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import { isClientFunctionCommand } from '../../test-run/commands/utils';
import Replicator from 'replicator';

export async function shouldSkipJsError (options: SkipJsErrorsOptions | boolean, err: any): Promise<boolean> {
    if (typeof options === 'boolean')
        return options;

    if (typeof options === 'object' && isClientFunctionCommand(options))
        return await processJsErrorsFunction(options, err);

    if (typeof options === 'object')
        return processJsErrorsOptions(options, err);

    return false;
}

export function processJsErrorsOptions (options: SkipJsErrorsOptions, err: any): boolean {
    const { stack, pageUrl, message } = decodeSkipJsErrorsOptions(options);

    return stack.test(err.stack) && pageUrl.test(err.pageUrl) && message.test(err.msg);
}

function processJsErrorsFunction (processingFunction: any, err: any): Promise<boolean> {
    const opts: SkipJsErrorsOptions = {
        stack:   err.stack,
        pageUrl: err.pageUrl,
        message: err.msg,
    };

    processingFunction.args = [[opts]];

    const executor = new ClientFunctionExecutor(processingFunction);

    return executor.getResult();
}

export function decodeSkipJsErrorsOptions ({ message = '', pageUrl = '', stack = '' }: SkipJsErrorsOptions): Dictionary<RegExp> {
    const replicator                  = new Replicator();
    const options: Dictionary<RegExp> = {};

    options.message = message && replicator.decode(message) as RegExp || new RegExp('');
    options.stack   = stack && replicator.decode(stack) as RegExp || new RegExp('');
    options.pageUrl = pageUrl && replicator.decode(pageUrl) as RegExp || new RegExp('');

    return options;
}
