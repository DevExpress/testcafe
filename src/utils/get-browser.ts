import { assign } from 'lodash';
import { ParsedUserAgent } from './parse-user-agent';
import BrowserConnection from '../browser/connection';

interface Browser extends ParsedUserAgent {
    alias: string;
    headless: boolean;
    nativeAutomation: boolean;
}

export default function getBrowser (browserConnection: BrowserConnection, nativeAutomation: boolean): Browser {
    const { browserInfo: { parsedUserAgent, alias } } = browserConnection;

    return assign({}, parsedUserAgent, {
        alias,
        headless: browserConnection.isHeadlessBrowser(),
        nativeAutomation,
    });
}
