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
    const { stack = '', pageUrl = '', message = '' } = decodeSkipJsErrorsOptions(options);

    const stackRegex   = stack || new RegExp(stack);
    const pageUrlRegex = pageUrl || new RegExp(pageUrl);
    const messageRegex = message || new RegExp(message);

    return stackRegex.test(err.stack) && pageUrlRegex.test(err.pageUrl) && messageRegex.test(err.msg);
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

export function decodeSkipJsErrorsOptions ({ message, pageUrl, stack }: SkipJsErrorsOptions): SkipJsErrorsOptions {
    const replicator                  = new Replicator();
    const options: Dictionary<RegExp> = {};

    options.message = replicator.decode(message || '') as RegExp;
    options.stack   = replicator.decode(stack || '') as RegExp;
    options.pageUrl = replicator.decode(pageUrl || '') as RegExp;

    return options;
}
