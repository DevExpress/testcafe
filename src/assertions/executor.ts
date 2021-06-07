import { EventEmitter } from 'events';
import delay from '../utils/delay';
import { isThennable } from '../utils/thennable';
import { ExternalAssertionLibraryError, AssertionUnawaitedPromiseError } from '../errors/test-run';
import ReExecutablePromise from '../utils/re-executable-promise';
import getFn from './get-fn';
import AssertionCommand from '../test-run/commands/assertion';
import { CallsiteRecord } from 'callsite-record';

const ASSERTION_DELAY = 200;

export default class AssertionExecutor extends EventEmitter {
    private readonly command: AssertionCommand;
    private readonly timeout: number;
    private readonly callsite: CallsiteRecord;
    private startTime: number | null;
    private passed: boolean;
    private inRetry: boolean;
    private readonly fn: Function;

    public constructor (command: AssertionCommand, timeout: number, callsite: CallsiteRecord) {
        super();

        this.command  = command;
        this.timeout  = timeout;
        this.callsite = callsite;

        this.startTime = null;
        this.passed    = false;
        this.inRetry   = false;

        const fn            = getFn(this.command);
        const actualCommand = this.command.actual;

        if (actualCommand instanceof ReExecutablePromise)
            this.fn = this._wrapFunction(fn);
        else if (!this.command.options.allowUnawaitedPromise && isThennable(actualCommand))
            throw new AssertionUnawaitedPromiseError(this.callsite);
        else
            this.fn = fn;
    }

    private _getTimeLeft (): number {
        const executionTime = new Date().getTime() - (this.startTime as number); // eslint-disable-line @typescript-eslint/no-extra-parens

        return this.timeout - executionTime;
    }

    private _onExecutionFinished (): void {
        if (this.inRetry)
            this.emit('end-assertion-retries', this.passed);
    }

    private _wrapFunction (fn: Function): Function {
        return async () => {
            const resultPromise = this.command.actual as ReExecutablePromise;

            while (!this.passed) {
                this.command.actual = await resultPromise._reExecute();

                try {
                    fn();
                    this.passed = true;
                    this._onExecutionFinished();
                }

                catch (err) {
                    if (this._getTimeLeft() <= 0) {
                        this._onExecutionFinished();
                        throw err;
                    }

                    await delay(ASSERTION_DELAY);

                    this.inRetry = true;
                    this.emit('start-assertion-retries', this._getTimeLeft());
                }
            }
        };
    }

    public async run (): Promise<void> {
        this.startTime = new Date().getTime();

        try {
            await this.fn();
        }

        catch (err) {
            if (err.name === 'AssertionError' || err.constructor.name === 'AssertionError')
                throw new ExternalAssertionLibraryError(err, this.callsite);

            if (err.isTestCafeError)
                err.callsite = this.callsite;

            throw err;
        }
    }
}
