/* eslint-disable no-restricted-properties */
import testCafeCore from '../../deps/testcafe-core';

const styleUtils = testCafeCore.styleUtils;

export function setStyles (element, styles) {
    for (const key in styles)
        styleUtils.set(element, key, styles[key]);
}
