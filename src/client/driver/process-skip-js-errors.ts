import { SkipJsErrorsOptionsObject } from '../../configuration/interfaces';
import ClientFunctionExecutor from './command-executors/client-functions/client-function-executor';
import { isClientFunctionCommand } from '../../test-run/commands/utils';

export async function shouldSkipJsError (options: boolean, err: any): Promise<boolean> {
    if (isClientFunctionCommand(options))
        return await processJsErrorsFunction(options, err);

    return options || false;
}

function processJsErrorsFunction (processingFunction: any, err: any): Promise<boolean> {
    const opts: SkipJsErrorsOptionsObject = {
        stack:   err.stack,
        pageUrl: err.pageUrl,
        message: err.msg,
    };

    processingFunction.args = [[opts]];

    const executor = new ClientFunctionExecutor(processingFunction);

    return executor.getResult();
}
