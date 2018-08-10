import hammerhead from '../deps/hammerhead';
import  { RequestBarrier, pageUnloadBarrier, browser } from '../deps/testcafe-core';
import DriverStatus from '../status';

const { Promise, createNativeXHR, utils } = hammerhead;

export default function executeNavigateTo (command) {
    const proxyUrl = utils.url.getProxyUrl(command.url);

    const ensurePagePromise = browser
            .sendXHR(proxyUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })
            .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => browser.sendXHR(proxyUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })))
            .catch(() => (new Promise(r => setTimeout(r, 300))).then(() => browser.sendXHR(proxyUrl, createNativeXHR, { parseResponse: false, addAcceptHeader: true })))
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
