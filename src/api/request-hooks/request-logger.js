import { ConfigureResponseEventOptions } from 'testcafe-hammerhead';
import RequestHook from './hook';
import { parse as parseUserAgent } from 'useragent';
import testRunTracker from '../test-run-tracker';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';

const DEFAULT_OPTIONS = {
    logRequestHeaders:     false,
    logRequestBody:        false,
    stringifyRequestBody:  false,
    logResponseHeaders:    false,
    logResponseBody:       false,
    stringifyResponseBody: false
};

class RequestLoggerImplementation extends RequestHook {
    constructor (requestFilterRuleInit, options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);
        RequestLoggerImplementation._assertLogOptions(options);

        const configureResponseEventOptions = new ConfigureResponseEventOptions(options.logResponseHeaders, options.logResponseBody);

        super(requestFilterRuleInit, configureResponseEventOptions);

        this.options = options;

        this._internalRequests = {};
    }

    static _assertLogOptions (logOptions) {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody)
            throw new APIError('RequestLogger', RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');

        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody)
            throw new APIError('RequestLogger', RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    }

    async onRequest (event) {
        const userAgent = parseUserAgent(event._requestInfo.userAgent).toString();

        const loggedReq = {
            id:        event._requestInfo.requestId,
            testRunId: event._requestInfo.sessionId,
            userAgent,
            request:   {
                url:    event._requestInfo.url,
                method: event._requestInfo.method,
            }
        };

        if (this.options.logRequestHeaders)
            loggedReq.request.headers = Object.assign({}, event._requestInfo.headers);

        if (this.options.logRequestBody)
            loggedReq.request.body = this.options.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;

        this._internalRequests[loggedReq.id] = loggedReq;
    }

    async onResponse (event) {
        const loggerReq = this._internalRequests[event.requestId];

        // NOTE: If the 'clear' method is called during a long running request,
        // we should not save a response part - request part has been already removed.
        if (!loggerReq)
            return;

        loggerReq.response            = {};
        loggerReq.response.statusCode = event.statusCode;

        if (this.options.logResponseHeaders)
            loggerReq.response.headers = Object.assign({}, event.headers);

        if (this.options.logResponseBody) {
            loggerReq.response.body = this.options.stringifyResponseBody && event.body
                ? event.body.toString()
                : event.body;
        }
    }

    _prepareInternalRequestInfo () {
        const testRun        = testRunTracker.resolveContextTestRun();
        let preparedRequests = Object.values(this._internalRequests);

        if (testRun)
            preparedRequests = preparedRequests.filter(r => r.testRunId === testRun.id);

        return preparedRequests;
    }

    _getCompletedRequests () {
        return this._prepareInternalRequestInfo().filter(r => r.response);
    }

    // API
    contains (predicate) {
        return ReExecutablePromise.fromFn(async () => {
            return !!this._getCompletedRequests().find(predicate);
        });
    }

    count (predicate) {
        return ReExecutablePromise.fromFn(async () => {
            return this._getCompletedRequests().filter(predicate).length;
        });
    }

    clear () {
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

    get requests () {
        return this._prepareInternalRequestInfo();
    }
}

export default function createRequestLogger (requestFilterRuleInit, logOptions) {
    return new RequestLoggerImplementation(requestFilterRuleInit, logOptions);
}

