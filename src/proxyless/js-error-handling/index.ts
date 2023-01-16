import { ProtocolApi } from 'chrome-remote-interface';
import { UncaughtErrorOnPage } from '../../shared/errors';
import ProxylessApiBase from '../api-base';
import Protocol from 'devtools-protocol';
import ExceptionThrownEvent = Protocol.Runtime.ExceptionThrownEvent;
import { SkipJsErrorsCommand } from '../../test-run/commands/actions';
import { UncaughtErrorInTestCode } from '../../errors/test-run';
import { SkipJsErrorsOptionsObject } from '../../configuration/interfaces';

const UNCAUGHT_PROMISE_REJECTION = 'Uncaught (in promise)';
const UNCAUGHT_JS_ERROR = 'Uncaught';
const NO_STACK_TRACE_AVAILABLE_MESSAGE = 'No stack trace available';


export default class JSErrorHandlingAPI extends ProxylessApiBase {
    private command: SkipJsErrorsCommand | null;

    constructor (browserId: string, client: ProtocolApi) {
        super(browserId, client);

        this.command = null;
    }

    public async init (): Promise<void> {
        this._client.Runtime.on('exceptionThrown', async ({ exceptionDetails }: ExceptionThrownEvent) => {
            this._addTestRunEvents();

            const errorMessage = this._getErrorMessage(exceptionDetails);
            const errFilter = this._getErrFilter(exceptionDetails, errorMessage);

            try {
                if (!this._getShouldSkipJsErrors(errFilter))
                    this._testRun.addProxylessJSError(new UncaughtErrorOnPage(errorMessage, exceptionDetails.url));
            }
            catch (err) {
                this._testRun.addProxylessJSError(new UncaughtErrorInTestCode(err));
            }
        });
    }

    public setErrorHandler (command: SkipJsErrorsCommand): void {
        this.command = command;
    }

    private _getErrorMessage (exceptionDetails: Protocol.Runtime.ExceptionDetails): string | undefined {
        if (exceptionDetails.text === UNCAUGHT_JS_ERROR)
            return exceptionDetails.exception?.description;

        if (exceptionDetails.text === UNCAUGHT_PROMISE_REJECTION)
            return exceptionDetails.exception?.value + `\n    ${NO_STACK_TRACE_AVAILABLE_MESSAGE}`;

        return void 0;
    }

    private _getErrFilter (exceptionDetails: Protocol.Runtime.ExceptionDetails, errorMessage: string | undefined): SkipJsErrorsOptionsObject {
        const stack = exceptionDetails.exception?.preview?.properties[0]?.value;
        const message = exceptionDetails.exception?.preview?.properties[1]?.value;

        return {
            stack:   stack || errorMessage,
            pageUrl: exceptionDetails.url,
            message: message || errorMessage,
        };
    }

    private _getShouldSkipJsErrors (errFilter: SkipJsErrorsOptionsObject): boolean {
        const options = this.command ? this.command.options : this._testRun.prepareSkipJsErrorsOption();

        if (options === true)
            return true;

        if (typeof options === 'function')
            // @ts-ignore
            return options(errFilter);

        return false;
    }

    private _addTestRunEvents (): void {
        this._testRun.once('done', this._dispose.bind(this));
    }

    private _dispose (): void {
        this.command = null;
    }
}
