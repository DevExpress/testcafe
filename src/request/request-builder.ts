import requestFunctionBuilder from './builder-symbol';
import testRunTracker from '../api/test-run-tracker';
import TestRun from '../test-run';
import TestRunProxy from '../services/compiler/test-run-proxy';
import axios from 'axios';
import ReExecutablePromise from '../utils/re-executable-promise';

const REST_METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head'];

const DEFAULT_RESPONSE = {
    status:     404,
    statusText: 'Not Found',
    headers:    {},
    data:       {},
};

export default class RequestBuilder {
    private readonly _url: string;
    private readonly _options: any;

    public constructor (url: string, options: any = {}) {
        this._url = url;
        this._options = options;
    }

    private getBoundTestRun (): TestRun | null {
        // NOTE: `boundTestRun` can be either TestController or TestRun instance.
        if (this._options.boundTestRun)
            return this._options.boundTestRun.testRun || this._options.boundTestRun;

        return null;
    }

    private _getTestRun (): TestRun | TestRunProxy | null {
        return this.getBoundTestRun() || testRunTracker.resolveContextTestRun();
    }

    private _executeRequest (url: string, options: any): ReExecutablePromise {
        return ReExecutablePromise.fromFn(async () => {
            const testRun = this._getTestRun();

            if (!testRun || testRun instanceof TestRunProxy)
                return null;

            let result = DEFAULT_RESPONSE;

            try {
                result = await axios(testRun.session.getProxyUrl(url), options);
            }
            catch (e) {
                result = e.response;
            }

            const {
                status,
                statusText,
                headers,
                data: body,
            } = result;

            return { status, statusText, headers, body };
        });
    }

    private _decorateFunction (fn: any): void {
        fn[requestFunctionBuilder] = this;

        REST_METHODS.forEach(method => {
            fn[method] = (url: string, options = {}) => this._executeRequest(url, { ...options, method });
        });
    }

    public getFunction (): any {
        const builder = this;

        const fn = function __$$request$$ (url: string, options: any): ReExecutablePromise {
            return builder._executeRequest(url, options);
        };

        this._decorateFunction(fn);

        return fn;
    }
}
