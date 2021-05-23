import TestRun from '../../test-run';
import TestRunProxy from '../../services/compiler/test-run-proxy';

interface TestController {
    browser: string;
    new (testRun: TestRun | TestRunProxy): TestController;
    _enqueueCommand (apiMethodName: string, CmdCtor: unknown, cmdArgs:object): () => Promise<unknown>;
}

declare const TestController: TestController;

export default TestController;
