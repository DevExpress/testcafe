import testRunTracker from '../api/test-run-tracker';
import TestRunProxy from '../services/compiler/test-run-proxy';
import ReExecutablePromise from '../utils/re-executable-promise';
import { assertType, is } from '../errors/runtime/type-assertions';
import { ClientFunctionAPIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { getCallsiteForMethod } from '../errors/get-callsite';
import TestRun from '../test-run';
import {
    ExternalRequestOptions,
    Method,
    ResponseOptions,
} from './interfaces';
import dispatchRequest from './dispatchRequest';

const REST_METHODS: Method[] = ['get', 'post', 'delete', 'put', 'patch', 'head'];
const REQUEST_GETTERS        = ['status', 'statusText', 'headers', 'body'];

const DEFAULT_EXECUTION_CALLSITE_NAME = '__$$request$$';

interface CallsiteNames {
    instantiation: string;
    execution: string;
}

export default class RequestBuilder {
    private callsiteNames: CallsiteNames;

    public constructor (callsiteNames: CallsiteNames) {
        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution:     callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME,
        };
    }

    private _getTestRun (): TestRun | TestRunProxy | null {
        return testRunTracker.resolveContextTestRun();
    }

    private _validateOptions (options: ExternalRequestOptions): void {
        assertType(is.string, this.callsiteNames.execution, 'The "url" argument', options.url);
    }

    private _executeCommand (url: string, options: ExternalRequestOptions = {}): ReExecutablePromise {
        options.url = url || options.url;

        this._validateOptions(options);

        const testRun  = this._getTestRun();
        const callsite = getCallsiteForMethod(this.callsiteNames.execution);

        if (!testRun || testRun instanceof TestRunProxy) {
            if (!testRun) {
                const err = new ClientFunctionAPIError(this.callsiteNames.execution, this.callsiteNames.instantiation, RUNTIME_ERRORS.clientFunctionCannotResolveTestRun);

                // NOTE: force callsite here, because more likely it will
                // be impossible to resolve it by method name from a lazy promise.
                err.callsite = callsite;

                throw err;
            }
        }

        const promise = ReExecutablePromise.fromFn(async () => {
            return dispatchRequest(testRun as TestRun, options);
        });

        REQUEST_GETTERS.forEach(getter => {
            Object.defineProperty(promise, getter, {
                get: () => ReExecutablePromise.fromFn(async () => {
                    const response = await dispatchRequest(testRun as TestRun, options);

                    return response[getter as keyof ResponseOptions];
                }),
            });
        });

        return promise;
    }

    private _decorateFunction (fn: Function): void {
        REST_METHODS.forEach(method => {
            Object.defineProperty(fn, method, {
                value: (url: string, options: ExternalRequestOptions) => this._executeCommand(url, { ...options, method }),
            });
        });
    }

    public getFunction (): Function {
        const builder = this;

        const fn = function __$$request$$ (url: string, options: ExternalRequestOptions): ReExecutablePromise {
            return builder._executeCommand(url, options);
        };

        this._decorateFunction(fn);

        return fn;
    }
}
