import hammerhead from '../deps/hammerhead';
import  { RequestBarrier, pageUnloadBarrier, browser } from '../deps/testcafe-core';
import DriverStatus from '../status';

const { Promise, createNativeXHR, utils } = hammerhead;

export default function executeNavigateTo (command) {
    const navigationUrl = utils.url.getNavigationUrl(command.url, window);

    const ensurePagePromise = browser
            .sendXHR(navigationUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })
            .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => browser.sendXHR(navigationUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })))
            .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => browser.sendXHR(navigationUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })))
            .catch(() => {});

    return ensurePagePromise
        .then(() => {
            var requestBarrier = new RequestBarrier();

            hammerhead.navigateTo(command.url);

            return Promise.all([requestBarrier.wait(), pageUnloadBarrier.wait()])
        })
        .then(() => new DriverStatus({ isCommandResult: true }))
        .catch(err => new DriverStatus({ isCommandResult: true, executionError: err }));
}
