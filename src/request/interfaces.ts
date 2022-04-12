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

export interface RequestOptions {
    method: Method,
    url: string,
    path: string,
    headers: OutgoingHttpHeaders,
    params: object,
    body: unknown,
    timeout: number,
    withCredentials: boolean,
    auth: {
        username: string,
        password: string
    },
    maxRedirects: number,
    proxy: {
        protocol: string,
        host: string,
        port: number,
        auth: {
            username: string,
            password: string,
            bearer?: string
        }
    },
}
