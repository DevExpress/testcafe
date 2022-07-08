import { IncomingMessage } from 'http';
import HTTP_HEADERS from '../../utils/http-headers';
import CONTENT_TYPES from '../../assets/content-types';
import { promisifyStream } from 'testcafe-hammerhead';
import { ResponseBody } from './interfaces';

export async function processResponseData (response: IncomingMessage, rawResponse = false): Promise<ResponseBody> {
    if (rawResponse)
        return response;

    const data = await promisifyStream(response);

    if (!response.headers[HTTP_HEADERS.contentType])
        return data;

    if ((response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.textPlain) ||
        (response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.textHtml))
        return data.toString('utf8');

    if ((response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.json))
        return data.length ? JSON.parse(data.toString('utf8')) : '';

    return data;
}
