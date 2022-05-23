import TestRun from '../test-run';
import { DestinationRequest } from 'testcafe-hammerhead';
import { IncomingMessage } from 'http';
import { ExternalRequestOptions, ResponseOptions } from './interfaces';
import { createRequestOptions } from './create-request-options';
import { processResponseData } from './process-response-data';

type StrictIncomingMessage = IncomingMessage & { statusCode: number; statusMessage: string };

async function send (testRun: TestRun, options: ExternalRequestOptions, callsite: string): Promise<ResponseOptions> {
    const requestOptions = await createRequestOptions(testRun, options, callsite);
    const request        = new DestinationRequest(requestOptions);
    const dataWaiter     = new Promise<StrictIncomingMessage>((resolve, reject) => {
        request.on('response', (res: StrictIncomingMessage) => resolve(res));
        request.on('error', (err: Error) => reject(err));
        request.on('fatalError', (err: string) => reject(new Error(err)));
    });

    const data = await dataWaiter;
    const body = await processResponseData(data, options.rawResponse);

    return {
        status:     data.statusCode,
        statusText: data.statusMessage,
        headers:    data.headers,
        body:       body,
    };
}

export default send;
