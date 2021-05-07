import {
    ConfigureResponseEventOptions,
    RequestEvent,
    ResponseEvent,
    RequestFilterRuleInit
} from 'testcafe-hammerhead';

import RequestHook from './hook';
import parseUserAgent from '../../utils/parse-user-agent';
import testRunTracker from '../test-run-tracker';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';

import {
    RequestHookLogOptionsInit,
    RequestHookLogOptions
} from './interfaces';

import { Dictionary } from '../../configuration/interfaces';


const DEFAULT_OPTIONS: RequestHookLogOptions = {
    logRequestHeaders:     false,
    logRequestBody:        false,
    stringifyRequestBody:  false,
    logResponseHeaders:    false,
    logResponseBody:       false,
    stringifyResponseBody: false
};

interface OptionallyLoggedPart {
    headers?: any;
    body?: Buffer | string;
}

interface LoggedRequestPart extends OptionallyLoggedPart {
    timestamp: number;
    url: string;
    method: string;
}
interface LoggedResponsePart extends OptionallyLoggedPart {
    statusCode: number;
    timestamp: number;
}

interface LoggedRequest {
    id: string;
    testRunId: string;
    userAgent: string;
    request: LoggedRequestPart;
    response?: LoggedResponsePart;
}

const REQUEST_LOGGER_CLASS_NAME = 'RequestLogger';

class RequestLoggerImplementation extends RequestHook {
    private readonly _options: RequestHookLogOptions;
    private _internalRequests: Dictionary<LoggedRequest>;

    public constructor (requestFilterRuleInit?: RequestFilterRuleInit | RequestFilterRuleInit[], options?: RequestHookLogOptionsInit) {
        const effectiveOptions = Object.assign({}, DEFAULT_OPTIONS, options) as RequestHookLogOptions;

        RequestLoggerImplementation._assertLogOptions(effectiveOptions);

        const configureResponseEventOptions = new ConfigureResponseEventOptions(effectiveOptions.logResponseHeaders, effectiveOptions.logResponseBody);

        super(requestFilterRuleInit, configureResponseEventOptions);

        this._className        = REQUEST_LOGGER_CLASS_NAME;
        this._options          = effectiveOptions;
        this._internalRequests = {};
    }

    private static _assertLogOptions (logOptions: RequestHookLogOptions): void {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody)
            throw new APIError('RequestLogger', RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');

        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody)
            throw new APIError('RequestLogger', RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    }

    public async onRequest (event: RequestEvent): Promise<void> {
        const loggedReq: LoggedRequest = {
            id:        event._requestInfo.requestId,
            testRunId: event._requestInfo.sessionId,
            userAgent: parseUserAgent(event._requestInfo.userAgent).prettyUserAgent,
            request:   {
                timestamp: Date.now(),
                url:       event._requestInfo.url,
                method:    event._requestInfo.method,
            }
        };

        if (this._options.logRequestHeaders)
            loggedReq.request.headers = Object.assign({}, event._requestInfo.headers);

        if (this._options.logRequestBody)
            loggedReq.request.body = this._options.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;

        this._internalRequests[loggedReq.id] = loggedReq;
    }

    public async onResponse (event: ResponseEvent): Promise<void> {
        const loggedReq = this._internalRequests[event.requestId];

        // NOTE: If the 'clear' method is called during a long running request,
        // we should not save a response part - request part has been already removed.
        if (!loggedReq)
            return;

        loggedReq.response = {
            statusCode: event.statusCode,
            timestamp:  Date.now()
        };

        if (this._options.logResponseHeaders)
            loggedReq.response.headers = Object.assign({}, event.headers);

        if (this._options.logResponseBody) {
            loggedReq.response.body = this._options.stringifyResponseBody && event.body
                ? event.body.toString()
                : event.body;
        }
    }

    private _prepareInternalRequestInfo (): LoggedRequest[] {
        const testRun        = testRunTracker.resolveContextTestRun();
        let preparedRequests = Object.values(this._internalRequests);

        if (testRun)
            preparedRequests = preparedRequests.filter(r => r.testRunId === testRun.id);

        return preparedRequests;
    }

    private _getCompletedRequests (): LoggedRequest[] {
        return this._prepareInternalRequestInfo().filter(r => r.response);
    }

    // API
    public contains (predicate: (request: LoggedRequest) => boolean): ReExecutablePromise {
        return ReExecutablePromise.fromFn(async () => {
            return !!this._getCompletedRequests().find(predicate);
        });
    }

    public count (predicate: (request: LoggedRequest) => boolean): ReExecutablePromise {
        return ReExecutablePromise.fromFn(async () => {
            return this._getCompletedRequests().filter(predicate).length;
        });
    }

    public clear (): void {
        const testRun = testRunTracker.resolveContextTestRun();

        if (testRun) {
            Object.keys(this._internalRequests).forEach(id => {
                if (this._internalRequests[id].testRunId === testRun.id)
                    delete this._internalRequests[id];
            });
        }
        else
            this._internalRequests = {};
    }

    public get requests (): LoggedRequest[] {
        return this._prepareInternalRequestInfo();
    }
}

export default function createRequestLogger (requestFilterRuleInit: RequestFilterRuleInit | RequestFilterRuleInit[] | undefined, logOptions: RequestHookLogOptionsInit): RequestLoggerImplementation {
    return new RequestLoggerImplementation(requestFilterRuleInit, logOptions);
}
