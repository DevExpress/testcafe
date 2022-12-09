import TestRun from '../../test-run';
import TestRunProxy from '../../services/compiler/test-run-proxy';
import WarningLog from '../../notifications/warning-log';
import { CommandBase } from '../../test-run/commands/base';
import { CallsiteRecord } from 'callsite-record';

export default class TestController {
    public browser: string;
    public constructor (testRun: TestRun | TestRunProxy);
    public testRun: TestRun;
    public warningLog: WarningLog;
    public enqueueCommand (CmdCtor: unknown, cmdArgs: object, validateCommand: Function, callsite?: CallsiteRecord): () => Promise<unknown>;
    public checkForExcessiveAwaits (checkedCallsite: CallsiteRecord, { actionId }: CommandBase): void;
    public static enableDebugForNonDebugCommands (): void;
    public static disableDebugForNonDebugCommands (): void;
}
