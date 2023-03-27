import { assign } from 'lodash';
import { ParsedUserAgent } from './parse-user-agent';
import BrowserConnection from '../browser/connection';

interface Browser extends ParsedUserAgent {
    alias: string;
    headless: boolean;
}

export default function getBrowser (browserConnection: BrowserConnection): Browser {
    const { browserInfo: { parsedUserAgent, alias } } = browserConnection;
    const prettyUserAgent                             = browserConnection.connectionInfo;

    return assign({}, parsedUserAgent, {
        alias,
        prettyUserAgent,
        headless: browserConnection.isHeadlessBrowser(),
    });
}
