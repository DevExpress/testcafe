import TestRun from '../../test-run';
import TestRunProxy from '../../services/compiler/test-run-proxy';
import { Context } from 'vm';

export default class TestController {
    public browser: string;
    public constructor (testRun: TestRun | TestRunProxy, executionContext?: Context);
    public _enqueueCommand (apiMethodName: string, CmdCtor: unknown, cmdArgs: object): () => Promise<unknown>;
    public static enableDebugForNonDebugCommands (): void;
    public static disableDebugForNonDebugCommands (): void;
    public getExecutionContext (): Context;
}
