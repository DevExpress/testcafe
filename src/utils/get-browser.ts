import BrowserConnection from '../browser/connection';
import { assign } from 'lodash';

export default function getBrowser (browserConnection: BrowserConnection) {
    const { browserInfo: { parsedUserAgent, alias } } = browserConnection;

    return assign({}, parsedUserAgent, { alias, headless: browserConnection.isHeadlessBrowser() });
}
