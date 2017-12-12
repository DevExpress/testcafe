import SelectorBuilder from '../../../client-functions/selectors/selector-builder';
import { ActionSelectorError } from '../../../errors/test-run';
import { APIError } from '../../../errors/runtime';
import { ExecuteSelectorCommand } from '../observation';
import { executeJsExpression } from '../../execute-js-expression';
import { isJSExpression } from '../utils';


export function initSelector (name, val, skipVisibilityCheck) {
    if (val instanceof ExecuteSelectorCommand)
        return val;

    try {
        if (isJSExpression(val))
            val = executeJsExpression(val.value, skipVisibilityCheck);

        var builder = new SelectorBuilder(val, { visibilityCheck: !skipVisibilityCheck }, { instantiation: 'Selector' });

        return builder.getCommand([]);
    }
    catch (err) {
        var msg = err.constructor === APIError ? err.rawMessage : err.message;

        throw new ActionSelectorError(name, msg);
    }
}
