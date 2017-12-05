import { EventEmitter } from 'events';
import delay from '../utils/delay';
import { ExternalAssertionLibraryError } from '../errors/test-run';
import ClientFunctionResultPromise from '../client-functions/result-promise';
import getFn from './get-fn';

const ASSERTION_DELAY = 200;

export default class AssertionExecutor extends EventEmitter {
    constructor (command, callsite) {
        super();

        this.command  = command;
        this.callsite = callsite;

        this.startTime = null;
        this.passed    = false;
        this.inRetry   = false;

        var fn = getFn(this.command);

        this.fn = this.command.actual instanceof ClientFunctionResultPromise ?
            this._wrapFunction(fn) : fn;
    }

    _getTimeLeft () {
        return this.command.options.timeout - (new Date() - this.startTime);
    }

    _onExecutionFinished () {
        if (this.inRetry)
            this.emit('end-assertion-retries', this.passed);
    }

    _wrapFunction (fn) {
        return async () => {
            var resultPromise = this.command.actual;

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

    async run () {
        this.startTime = new Date();

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
