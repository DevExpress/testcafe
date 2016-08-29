/* global Symbol */
import { assignIn } from 'lodash';
import Promise from 'pinkie';
import promisifyEvent from 'promisify-event';
import BrowserConnection from '../connection';
import WARNING_MESSAGE from '../../warnings/message';


const name = Symbol();

export default class BrowserProviderPluginHost {
    constructor (providerObject, providerName) {
        assignIn(this, providerObject);

        this[name] = providerName;
    }


    // Helpers
    runInitScript (browserId, code) {
        var connection = BrowserConnection.getById(browserId);

        return connection.runInitScript(`(${code})()`);
    }

    waitForConnectionReady (browserId) {
        var connection = BrowserConnection.getById(browserId);

        if (connection.ready)
            return Promise.resolve();

        return promisifyEvent(connection, 'ready');
    }

    reportWarning (browserId, ...args) {
        var connection = BrowserConnection.getById(browserId);

        connection.addWarning(...args);
    }

    setUserAgentMetaInfo (browserId, message) {
        var connection = BrowserConnection.getById(browserId);

        connection.setProviderMetaInfo(message);
    }

    // API
    // Required
    // Browser control
    async openBrowser (/* browserId, pageUrl, browserName */) {
        throw new Error('Not implemented!');
    }

    async closeBrowser (/* browserId */) {
        throw new Error('Not implemented!');
    }


    // Optional
    // Initialization
    async init () {
        return;
    }

    async dispose () {
        return;
    }


    // Browser names handling
    async getBrowserList () {
        throw new Error('Not implemented!');
    }

    async isValidBrowserName (/* browserName */) {
        return true;
    }

    // Extra functions
    async resizeWindow (/* browserId, width, height, currentWidth, currentHeight */) {
        this.reportWarning(WARNING_MESSAGE.resizeNotSupportedByBrowserProvider, this[name]);
    }

    async takeScreenshot (/* browserId, screenshotPath, pageWidth, pageHeight */) {
        this.reportWarning(WARNING_MESSAGE.screenshotNotSupportedByBrowserProvider, this[name]);
    }
}
