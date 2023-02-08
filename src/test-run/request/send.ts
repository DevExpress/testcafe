import TestRun from '../index';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import { createRequestOptions } from './create-request-options';
import { processResponseData } from './process-response-data';
import HTTP_HEADERS from '../../utils/http-headers';
import { RequestRuntimeError } from '../../errors/runtime';
import { CallsiteRecord } from 'callsite-record';
import { RUNTIME_ERRORS } from '../../errors/types';

import {
    DestinationRequest,
    sameOriginCheck,
    RequestOptions,
} from 'testcafe-hammerhead';

type StrictIncomingMessage = IncomingMessage & { statusCode: number; statusMessage: string };

export async function send (requestOptions: RequestOptions, rawResponse?: boolean): Promise<ResponseOptions | string> {
    const request = new DestinationRequest(requestOptions);

    const dataWaiter = new Promise<StrictIncomingMessage | string>(resolve => {
        request.on('response', (res: StrictIncomingMessage) => resolve(res));
        request.on('error', (err: Error) => resolve(err.message));
        request.on('fatalError', (message: string) => resolve(message));
    });

    const data = await dataWaiter;

    if (typeof data === 'string')
        return data;

    const body = await processResponseData(data, rawResponse);

    return {
        status:     data.statusCode,
        statusText: data.statusMessage,
        headers:    data.headers,
        body:       body,
    };
}

export async function sendRequestThroughAPI (testRun: TestRun, options: ExternalRequestOptions, callsite: CallsiteRecord | null): Promise<ResponseOptions> {
    const currentPageUrl = new URL(await testRun.getCurrentUrl());

    const requestOptions = await createRequestOptions(currentPageUrl, testRun, options, callsite);

    const data = await send(requestOptions, options.rawResponse);

    if (typeof data === 'string')
        throw new RequestRuntimeError(callsite, RUNTIME_ERRORS.requestRuntimeError, data.replace(/<.*?>/g, ''));

    const setCookie  = (data.headers as IncomingHttpHeaders)[HTTP_HEADERS.setCookie];
    const sameOrigin = !currentPageUrl.host || sameOriginCheck(currentPageUrl.href, requestOptions.url);

    if (setCookie && (sameOrigin || options.withCredentials))
        await testRun.cookieProvider.setCookies(setCookie, currentPageUrl.href);

    return data;
}
