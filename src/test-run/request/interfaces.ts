import { IncomingMessage, OutgoingHttpHeaders } from 'http';
import { Dictionary } from '../../configuration/interfaces';
import { Buffer } from 'buffer';

export enum Credentials { include, sameOrigin, omit, unknown }

export interface AuthOptions {
    username: string;
    password: string;
}

export type Params = URLSearchParams | Dictionary<string | number | boolean>

export interface ProxyOptions {
    protocol?: string;
    host: string;
    port: number | string;
    auth?: AuthOptions;
}

export interface ExternalRequestOptions {
    url: string | URL;
    method?: string;
    headers?: OutgoingHttpHeaders;
    params?: Params;
    body?: any;
    timeout?: number;
    withCredentials?: boolean;
    auth?: AuthOptions;
    proxy?: ProxyOptions;
    rawResponse?: boolean;
}

export type ResponseBody = IncomingMessage | Buffer | object | string;

export interface ResponseOptions {
    status: number;
    statusText: string;
    headers: object;
    body: ResponseBody;
}
