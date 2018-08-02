import SelectorBuilder from '../../../client-functions/selectors/selector-builder';
import { ActionSelectorError } from '../../../errors/test-run';
import { APIError } from '../../../errors/runtime';
import { ExecuteSelectorCommand } from '../observation';
import { executeJsExpression } from '../../execute-js-expression';
import { isJSExpression } from '../utils';

export function initUploadSelector (name, val, initOptions) {
    initOptions.skipVisibilityCheck = true;

    return initSelector(name, val, initOptions);
}

export function initSelector (name, val, { skipVisibilityCheck, testRun, collectionMode }) {
    if (val instanceof ExecuteSelectorCommand)
        return val;

    try {
        if (isJSExpression(val))
            val = executeJsExpression(val.value, testRun, skipVisibilityCheck, collectionMode);

        const builder = new SelectorBuilder(val, {
            visibilityCheck: !skipVisibilityCheck,
            collectionMode
        }, { instantiation: 'Selector' });

        return builder.getCommand([]);
    }
    catch (err) {
        const msg = err.constructor === APIError ? err.rawMessage : err.message;

        throw new ActionSelectorError(name, msg);
    }
}
