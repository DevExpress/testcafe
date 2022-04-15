import { OutgoingHttpHeaders } from 'http';

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

export interface ExternalRequestOptions {
    method?: Method;
    url?: string;
    path?: string;
    headers?: OutgoingHttpHeaders;
    params?: object;
    body?: object;
    timeout?: number;
    withCredentials?: boolean;
    auth?: {
        username: string;
        password: string;
    };
    maxRedirects?: number;
    proxy?: {
        protocol: string;
        host: string;
        port: number;
        auth: {
            username: string;
            password: string;
            bearer?: string;
        };
    };
}

export interface ResponseOptions {
    status: number;
    statusText: string;
    headers: object;
    body: unknown;
}
