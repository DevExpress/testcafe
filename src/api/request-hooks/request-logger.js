import { ConfigureResponseEventOptions } from 'testcafe-hammerhead';
import RequestHook from './hook';
import { parse as parseUserAgent } from 'useragent';
import testRunTracker from '../test-run-tracker';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { RequestHookConfigureAPIError } from '../../errors/test-run/index';

const DEFAULT_OPTIONS = {
    logRequestHeaders:     false,
    logRequestBody:        false,
    stringifyRequestBody:  false,
    logResponseHeaders:    false,
    logResponseBody:       false,
    stringifyResponseBody: false
};

class RequestLogger extends RequestHook {
    constructor (requestFilterRuleInit, options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);
        RequestLogger._assertLogOptions(options);

        const configureResponseEventOptions = new ConfigureResponseEventOptions(options.logResponseHeaders, options.logResponseBody);

        super(requestFilterRuleInit, configureResponseEventOptions);

        this.options = options;

        this._internalRequests = {};
    }

    static _assertLogOptions (logOptions) {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody)
            throw new RequestHookConfigureAPIError(RequestLogger.name, 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');

        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody)
            throw new RequestHookConfigureAPIError(RequestLogger.name, 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    }

    onRequest (event) {
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

    onResponse (event) {
        const loggerReq = this._internalRequests[event.requestId];

        if (!loggerReq)
            throw new TypeError(`Cannot find a recorded request with id=${event.id}. This is an internal TestCafe problem. Please contact the TestCafe team and provide an example to reproduce the problem.`);

        loggerReq.response            = {};
        loggerReq.response.statusCode = event.statusCode;

        if (this.options.logResponseHeaders)
            loggerReq.response.headers = Object.assign({}, event.headers);

        if (this.options.logResponseBody)
            loggerReq.response.body = this.options.stringifyResponseBody ? event.body.toString() : event.body;
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
    return new RequestLogger(requestFilterRuleInit, logOptions);
}

