import { Stream } from 'stream';
import { Buffer } from 'buffer';
import { ResponseOptions } from './interfaces';
import { IncomingMessage } from 'http';
import HTTP_HEADERS from '../utils/http-headers';
import CONTENT_TYPES from '../assets/content-types';

function streamToBuffer (stream: Stream): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        stream.on('data', chunk => {
            chunks.push(Buffer.from(chunk));
        });
        stream.on('error', err => {
            reject(err);
        });
        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
    });
}

export async function processResponseData (response: IncomingMessage, needProcess = true): Promise<ResponseOptions | IncomingMessage | Buffer | string> {

    if (!needProcess)
        return response;

    const data = await streamToBuffer(response);

    if ((response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.textPlain) ||
        (response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.textHtml))
        return data.toString('utf8');

    if ((response.headers[HTTP_HEADERS.contentType] as string).startsWith(CONTENT_TYPES.json))
        return JSON.parse(data.toString('utf8'));

    return data;
}
