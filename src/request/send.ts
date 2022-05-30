import TestRun from '../test-run';
import { DestinationRequest } from 'testcafe-hammerhead';
import { IncomingMessage } from 'http';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import { createRequestOptions } from './create-request-options';
import { processResponseData } from './process-response-data';
import HTTP_HEADERS from '../utils/http-headers';
import { RequestRuntimeError } from '../errors/runtime';
import { CallsiteRecord } from 'callsite-record';
import { castArray } from 'lodash';

type StrictIncomingMessage = IncomingMessage & { statusCode: number; statusMessage: string };

async function send (testRun: TestRun, options: ExternalRequestOptions, callsite: CallsiteRecord | null): Promise<ResponseOptions> {
    const currentPageUrl = await testRun.getCurrentUrl();
    const requestOptions = await createRequestOptions(currentPageUrl, testRun, options, callsite);
    const request        = new DestinationRequest(requestOptions);
    const dataWaiter     = new Promise<StrictIncomingMessage | string>(resolve => {
        request.on('response', (res: StrictIncomingMessage) => resolve(res));
        request.on('error', (err: Error) => resolve(err.message));
        request.on('fatalError', (message: string) => resolve(message));
    });

    const data = await dataWaiter;

    if (typeof data === 'string')
        throw new RequestRuntimeError(callsite, data);

    const setCookie = data.headers[HTTP_HEADERS.setCookie];

    if (setCookie)
        testRun.session.cookies.copySyncCookies(castArray(setCookie).join(';'), currentPageUrl);

    const body = await processResponseData(data, options.rawResponse);

    return {
        status:     data.statusCode,
        statusText: data.statusMessage,
        headers:    data.headers,
        body:       body,
    };
}

export default send;
