import testRunTracker from '../api/test-run-tracker';
import TestRunProxy from '../services/compiler/test-run-proxy';
import axios, {
    Method,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import ReExecutablePromise from '../utils/re-executable-promise';

const REST_METHODS: Method[] = ['get', 'post', 'delete', 'put', 'patch', 'head'];
const REQUEST_GETTERS        = ['status', 'statusText', 'headers', 'body'];

const DEFAULT_RESPONSE = {
    status:     404,
    statusText: 'Not Found',
    headers:    {},
    data:       {},
};

interface RequestOptions extends AxiosRequestConfig {
    body?: unknown;
}

interface ResponseOptions {
    status: number;
    statusText: string;
    headers: object;
    body: unknown;
}

export default class RequestBuilder {
    private static async _executeRequest (url: string, options: RequestOptions = {}): Promise<ResponseOptions> {
        const testRun = testRunTracker.resolveContextTestRun();

        if (!testRun || testRun instanceof TestRunProxy)
            throw new Error('TestRun doesn\'t exist');

        let result: AxiosResponse;

        //NOTE: Additional header to recognize API requests in the hammerhead
        options.headers = Object.assign({ 'is-request': true }, options?.headers);
        options.data = options.body;

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

    private _executeCommand (url: string, options: RequestOptions): ReExecutablePromise {
        const promise = ReExecutablePromise.fromFn(async () => {
            return RequestBuilder._executeRequest(url, options);
        });

        REQUEST_GETTERS.forEach(getter => {
            Object.defineProperty(promise, getter, {
                get: () => ReExecutablePromise.fromFn(async () => {
                    const response = await RequestBuilder._executeRequest(url, options);

                    return response[getter as keyof ResponseOptions];
                }),
            });
        });

        return promise;
    }

    private _decorateFunction (fn: Function): void {
        REST_METHODS.forEach(method => {
            Object.defineProperty(fn, method, {
                value: (url: string, options = {}) => this._executeCommand(url, { ...options, method }),
            });
        });
    }

    public getFunction (): Function {
        const builder = this;

        const fn = function __$$request$$ (url: string, options: RequestOptions): ReExecutablePromise {
            return builder._executeCommand(url, options);
        };

        this._decorateFunction(fn);

        return fn;
    }
}
