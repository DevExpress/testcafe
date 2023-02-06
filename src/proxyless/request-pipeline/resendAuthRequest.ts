import Protocol from 'devtools-protocol';
import Network = Protocol.Network;
import { AuthCredentials } from '../../api/structure/interfaces';
import { send } from '../../test-run/request/send';
import { ResponseOptions } from '../../test-run/request/interfaces';
import { RequestOptions } from 'testcafe-hammerhead';
// @ts-ignore
import urlToHttpOptions from 'url-to-options';

export async function resendAuthRequest (request: Network.Request, credentials: AuthCredentials): Promise<ResponseOptions | string> {
    const url = new URL(request.url);

    const urlRequestOptions = urlToHttpOptions(url);

    const requestOptions = new RequestOptions(Object.assign(urlRequestOptions, {
        body:    request.postData || '',
        auth:    `${credentials.username}:${credentials.password}`,
        headers: request.headers,
        method:  request.method,
    }));

    return send(requestOptions);
}
