import hammerhead from '../deps/hammerhead';
import  { RequestBarrier, pageUnloadBarrier, browser } from '../deps/testcafe-core';
import DriverStatus from '../status';

const { Promise, createNativeXHR, nativeMethods, utils } = hammerhead;

const STORAGE_PREFIX = 'hammerhead|storage-wrapper';

function findStorageKey (storage) {
    for(let i = 0; i < storage.length; i++) {
        const key = storage.key(i);

        if (key.indexOf(STORAGE_PREFIX) === 0)
            return key;
    }

    return '';
}

function restoreStorage (storageGetter, savedStorage) {
    const storage = storageGetter.call(window);
    const storageKey = findStorageKey(storage);

    if (!storageKey)
        return;

    storage.setItem(storageKey, savedStorage);
}

export default function executeNavigateTo (command) {
    const proxyUrl = utils.url.getProxyUrl(command.url);

    if (command.stateSnapshot) {
        let stateSnapshot = JSON.parse(command.stateSnapshot);

        if (!stateSnapshot)
            stateSnapshot = { storages: { localStorage: '[[],[]]', sessionStorage: '[[],[]]' } };

        hammerhead.sandbox.storageSandbox.lock();

        restoreStorage(nativeMethods.winSessionStorageGetter, stateSnapshot.storages.sessionStorage);
        restoreStorage(nativeMethods.winLocalStorageGetter, stateSnapshot.storages.localStorage);
    }

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
