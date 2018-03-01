import { ConfigureResponseEventOptions } from 'testcafe-hammerhead';
import RequestHook from './hook';
import { parse as parseUserAgent } from 'useragent';
import testRunTracker from '../test-run-tracker';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { RequestHookConfigureAPIError } from '../../errors/test-run/index';

const DEFAULT_LOG_OPTIONS = {
    logRequestHeaders:     false,
    logRequestBody:        false,
    stringifyRequestBody:  false,
    logResponseHeaders:    false,
    logResponseBody:       false,
    stringifyResponseBody: false
};

class RequestLogger extends RequestHook {
    constructor (requestFilterRuleInit, logOptions) {
        logOptions = Object.assign({}, DEFAULT_LOG_OPTIONS, logOptions);
        RequestLogger._assertLogOptions(logOptions);

        const configureResponseEventOptions = new ConfigureResponseEventOptions(logOptions.logResponseHeaders, logOptions.logResponseBody);

        super(requestFilterRuleInit, configureResponseEventOptions);

        this.logOptions = logOptions;

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
            sessionId: event._requestInfo.sessionId,
            userAgent,
            request:   {
                url:    event._requestInfo.url,
                method: event._requestInfo.method,
            }
        };

        if (this.logOptions.logRequestHeaders)
            loggedReq.request.headers = Object.assign({}, event._requestInfo.headers);

        if (this.logOptions.logRequestBody)
            loggedReq.request.body = this.logOptions.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;

        this._internalRequests[loggedReq.id] = loggedReq;
    }

    onResponse (event) {
        const loggerReq = this._internalRequests[event.requestId];

        if (!loggerReq)
            throw new TypeError(`Cannot find a recorded request with id=${event.id}. This is an internal TestCafe problem. Please contact the TestCafe team and provide an example to reproduce the problem.`);

        loggerReq.response            = {};
        loggerReq.response.statusCode = event.statusCode;

        if (this.logOptions.logResponseHeaders)
            loggerReq.response.headers = Object.assign({}, event.headers);

        if (this.logOptions.logResponseBody)
            loggerReq.response.body = this.logOptions.stringifyResponseBody ? event.body.toString() : event.body;
    }

    _prepareInternalRequestInfo () {
        const testRun        = testRunTracker.resolveContextTestRun();
        let preparedRequests = Object.values(this._internalRequests);

        if (testRun)
            preparedRequests = preparedRequests.filter(r => r.sessionId === testRun.id);

        return preparedRequests;
    }

    // API
    contains (predicate) {
        return ReExecutablePromise.fromFn(async () => {
            return !!this._prepareInternalRequestInfo().find(predicate);
        });
    }

    count (predicate) {
        return ReExecutablePromise.fromFn(async () => {
            return this._prepareInternalRequestInfo().filter(predicate).length;
        });
    }

    clear () {
        const testRun = testRunTracker.resolveContextTestRun();

        if (testRun) {
            Object.keys(this._internalRequests).forEach(id => {
                if (this._internalRequests[id].sessionId === testRun.id)
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

