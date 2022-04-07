/*eslint-disable*/
import requestFunctionBuilder from './builder-symbol';
import testRunTracker from '../api/test-run-tracker';
import TestRun from '../test-run';
import TestRunProxy from '../services/compiler/test-run-proxy';
import axios, { AxiosResponse } from 'axios';
import ReExecutablePromise from '../utils/re-executable-promise';

const REST_METHODS = ['get', 'post', 'delete', 'put', 'patch', 'head'];
const REQUEST_GETTERS = ['status', 'statusText', 'headers', 'body'];

const DEFAULT_RESPONSE = {
    status:     404,
    statusText: 'Not Found',
    headers:    {},
    data:       {},
};

interface Response {
    status: number;
    statusText: string;
    headers: object;
    body: any;
}

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

    private async _executeRequest(url: string, options: any = {}): Promise<Response> {
        const testRun = this._getTestRun();

        if (!testRun || testRun instanceof TestRunProxy)
            throw new Error('TestRun doesn\'t exist');

        let result: AxiosResponse;

        //NOTE: Additional header to recognize API requests in the hammerhead
        options.headers = Object.assign({ 'is-request': true }, options?.headers);

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
              } = result || DEFAULT_RESPONSE;

        return { status, statusText, headers, body };
    }

    private _executeCommand (url: string, options: any): ReExecutablePromise {
        const promise =  ReExecutablePromise.fromFn(async () => {
            return this._executeRequest(url, options);
        });

        REQUEST_GETTERS.forEach((getter) => {
            Object.defineProperty(promise, getter, {
                get: () => ReExecutablePromise.fromFn(async () => {
                    const response = await this._executeRequest(url, options);

                    return response[getter as keyof Response];
                })
            })
        })

        return promise;
    }

    private _decorateFunction (fn: any): void {
        fn[requestFunctionBuilder] = this;

        REST_METHODS.forEach(method => {
            fn[method] = (url: string, options = {}) => this._executeCommand(url, { ...options, method });
        });
    }

    public getFunction (): any {
        const builder = this;

        const fn = function __$$request$$ (url: string, options: any): ReExecutablePromise {
            return builder._executeCommand(url, options);
        };

        this._decorateFunction(fn);

        return fn;
    }
}
