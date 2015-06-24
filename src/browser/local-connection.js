import BrowserConnection from './connection';

export default class LocalBrowserConnection extends BrowserConnection {
    constructor (gateway, runParams) {
        super(gateway);
    }
}