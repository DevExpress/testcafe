import TestRun from '../test-run';
import { DestinationRequest } from 'testcafe-hammerhead';
import { IncomingMessage } from 'http';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import { processRequestOptions } from './process-request-options';
import { processResponseData } from './process-response-data';

const DEFAULT_STATUS      = 404;
const DEFAULT_STATUS_TEXT = 'Not found.';

async function dispatchRequest (testRun: TestRun, options: ExternalRequestOptions, callsite: string): Promise<ResponseOptions> {
    const requestOptions = await processRequestOptions(testRun, options, callsite);
    const request        = new DestinationRequest(requestOptions);
    const dataWaiter     = new Promise<IncomingMessage | Error>(resolve => {
        request.on('response', (res: IncomingMessage) => resolve(res));
        request.on('error', (err: Error) => resolve(err));
        request.on('fatalError', (err: string) => resolve(new Error(err)));
    });

    const data = await dataWaiter;

    if (data instanceof Error)
        throw data;

    const body = await processResponseData(data, options.processResponse);

    return {
        status:     data.statusCode || DEFAULT_STATUS,
        statusText: data.statusMessage || DEFAULT_STATUS_TEXT,
        headers:    data.headers,
        body:       body,
    };
}

export default dispatchRequest;
