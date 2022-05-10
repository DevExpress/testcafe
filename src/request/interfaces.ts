import { OutgoingHttpHeaders } from 'http';
import { Dictionary } from '../configuration/interfaces';

export type Method =
    | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'purge' | 'PURGE'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK';

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
    method?: Method;
    headers?: OutgoingHttpHeaders;
    params?: Params;
    body?: object;
    timeout?: number;
    withCredentials?: boolean;
    auth?: AuthOptions;
    maxRedirects?: number;
    proxy?: ProxyOptions;
    processResponse?: boolean;
}

export interface ResponseOptions {
    status: number;
    statusText: string;
    headers: object;
    body: unknown;
}
