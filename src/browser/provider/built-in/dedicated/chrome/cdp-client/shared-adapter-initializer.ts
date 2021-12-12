import ExecutionContext from './execution-context';
import { ServerNode } from './types';
import { ScrollOptions } from '../../../../../../test-run/commands/options';
import { getClient } from './clients-manager';
import { initializeAdapter } from '../../../../../../shared/adapter';
import { LeftTopValues } from '../../../../../../shared/utils/values/axis-values';
import { ScrollResultProxyless } from '../../../../../../client/core/scroll';
import * as domUtils from './utils/dom-utils';
import * as positionUtils from './utils/position-utils';
import * as styleUtils from './utils/style-utils';


initializeAdapter({
    PromiseCtor: Promise,

    nativeMethods: {
        setTimeout,
        clearTimeout,
        arrayIndexOf: Array.prototype.indexOf,
        arraySplice:  Array.prototype.splice,
        arraySlice:   Array.prototype.slice,
        arrayFilter:  Array.prototype.filter,
        objectAssign: Object.assign,
        objectKeys:   Object.keys,
        dateNow:      Date.now,
    },

    scroll: async (el: ServerNode, opts: ScrollOptions) => {
        let currCxt = ExecutionContext.current as ExecutionContext | null;
        let result  = null as boolean | null;
        let margin  = void 0 as undefined | LeftTopValues<number>;

        do {
            const { exceptionDetails, result: resultObj } = await getClient().Runtime.callFunctionOn({
                returnByValue:       true,
                awaitPromise:        true,
                executionContextId:  ExecutionContext.getCurrentContextId(),
                arguments:           [{ objectId: el.objectId }, { value: opts }, { value: margin }],
                functionDeclaration: `function (el, opts) {
                    return window["%proxyless%"].scroll(el, opts);
                }`,
            });

            if (exceptionDetails)
                throw exceptionDetails;

            const scrollResult = resultObj.value as ScrollResultProxyless;

            if (currCxt && currCxt !== currCxt.parent) {
                // TODO:
                //el           = findIframeByWindow(currCxt);
                currCxt      = currCxt.parent;
                result       = result ?? scrollResult.scrollWasPerformed;
                margin       = scrollResult.maxScrollMargin;
                opts.offsetX = scrollResult.offsetX;
                opts.offsetY = scrollResult.offsetY;
            }

        }
        while (currCxt && currCxt !== currCxt.parent);

        return result as boolean;
    },

    getElementExceptUI: positionUtils.getElementFromPoint,

    getOffsetOptions: () => ({ offsetX: 0, offsetY: 0 }),

    dom:      domUtils,
    position: positionUtils,
    style:    styleUtils,
    browser:  { isChrome: true },
});
