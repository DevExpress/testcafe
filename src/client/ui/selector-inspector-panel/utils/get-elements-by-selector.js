import { browser } from '../../deps/testcafe-core';
import { createNativeXHR, nativeMethods } from '../../deps/hammerhead';

import SelectorExecutor from '../../../driver/command-executors/client-functions/selector-executor/index';
import INTERNAL_PROPERTIES from '../../../driver/internal-properties';

const GLOBAL_TIMEOUT = 5000;

function createNotFoundError () {
    return null;
}

function createIsInvisibleError () {
    return null;
}

async function parseSelector (selector) {
    const { communicationUrls } = window[INTERNAL_PROPERTIES.testCafeDriverInstance];

    return browser.parseSelector(communicationUrls.parseSelector, createNativeXHR, selector);
}

async function executeSelector (parsedSelector) {
    const startTime        = nativeMethods.date();
    const selectorExecutor = new SelectorExecutor(parsedSelector, GLOBAL_TIMEOUT, startTime, createNotFoundError, createIsInvisibleError);
    const elements         = await selectorExecutor.getResult();

    return elements;
}

export async function getElementsBySelector (selector) {
    const parsedSelector = await parseSelector(selector);

    return executeSelector(parsedSelector).catch(() => null);
}
