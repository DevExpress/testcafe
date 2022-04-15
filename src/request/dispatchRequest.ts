import TestRun from '../test-run';
import { DestinationRequest } from 'testcafe-hammerhead';
import { IncomingMessage } from 'http';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import { processRequestOptions } from './process-request-options';
import { processResponseData } from './process-response-data';

const DEFAULT_STATUS      = 404;
const DEFAULT_STATUS_TEXT = 'Not found.';

async function dispatchRequest (testRun: TestRun, options: ExternalRequestOptions): Promise<ResponseOptions> {
    const requestOptions = processRequestOptions(testRun, options);
    const request        = new DestinationRequest(requestOptions);
    const dataWaiter     = new Promise<IncomingMessage | Error>(resolve => {
        request.on('response', (err: IncomingMessage) => resolve(err));
        request.on('error', (err: Error) => resolve(err));
    });

    const data = await dataWaiter;

    if (data instanceof Error)
        throw data;

    const body = await processResponseData(data);

    return {
        status:     data.statusCode || DEFAULT_STATUS,
        statusText: data.statusMessage || DEFAULT_STATUS_TEXT,
        headers:    data.headers,
        body:       body,
    };
}

export default dispatchRequest;
