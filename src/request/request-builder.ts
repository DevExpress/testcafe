import testRunTracker from '../api/test-run-tracker';
import ReExecutablePromise from '../utils/re-executable-promise';
import { ClientFunctionAPIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { getCallsiteForMethod } from '../errors/get-callsite';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import send from './send';
import validateOptions from './validate-options';

const lazyRequire  = require('import-lazy')(require);
const TestRunProxy = lazyRequire('../services/compiler/test-run-proxy');
const TestRun      = lazyRequire('../test-run');

export const EXTENDED_METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head'];

const REQUEST_GETTERS: (keyof ResponseOptions)[] = ['status', 'statusText', 'headers', 'body'];

const DEFAULT_CALLSITE_NAMES = {
    instantiation: 'Request',
    execution:     '__$$request$$',
};

interface CallsiteNames {
    instantiation: string;
    execution: string;
}

export default class RequestBuilder {
    private callsiteNames: CallsiteNames;

    public constructor () {
        this.callsiteNames = DEFAULT_CALLSITE_NAMES;
    }

    private _getTestRun (): typeof TestRun | typeof TestRunProxy | null {
        return testRunTracker.resolveContextTestRun();
    }

    private _prepareOptions (urlOpts: string | ExternalRequestOptions, options: Partial<ExternalRequestOptions>): ExternalRequestOptions {
        if (typeof urlOpts === 'object')
            return urlOpts;

        return {
            ...options,
            url: urlOpts || options.url || '',
        };
    }

    private _executeCommand (url: string, options: Partial<ExternalRequestOptions> = {}, callsiteName = this.callsiteNames.execution): ReExecutablePromise {
        const preparedOptions = this._prepareOptions(url, options);

        validateOptions(preparedOptions, this.callsiteNames.execution);

        const testRun  = this._getTestRun();
        const callsite = getCallsiteForMethod(callsiteName);

        if (!testRun || testRun instanceof TestRunProxy)
            throw new ClientFunctionAPIError(callsite, this.callsiteNames.instantiation, RUNTIME_ERRORS.clientFunctionCannotResolveTestRun);

        const promise = ReExecutablePromise.fromFn(async () => {
            return send(testRun, preparedOptions, callsite);
        });

        REQUEST_GETTERS.forEach(getter => {
            Object.defineProperty(promise, getter, {
                get: () => ReExecutablePromise.fromFn(async () => {
                    const response = await send(testRun, preparedOptions, callsite);

                    return response[getter];
                }),
            });
        });

        return promise;
    }

    private _decorateFunction (fn: Function): void {
        EXTENDED_METHODS.forEach(method => {
            Object.defineProperty(fn, method, {
                value: this._createFunction({ method }),
            });
        });
    }

    private _createFunction (bindOptions?: Partial<ExternalRequestOptions>): Function {
        const builder = this;

        return function __$$request$$ (url: string, options: ExternalRequestOptions): ReExecutablePromise {
            return builder._executeCommand(url, Object.assign({}, options, bindOptions || {}));
        };
    }

    public getFunction (): Function {
        const fn = this._createFunction();

        this._decorateFunction(fn);

        return fn;
    }
}
