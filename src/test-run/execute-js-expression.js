import { createContext, runInContext } from 'vm';
import SelectorBuilder from '../client-functions/selectors/selector-builder';

export function executeJsExpression (expression, skipVisibilityCheck) {
    var sandbox = {
        Selector: (fn, options = {}) => {
            if (skipVisibilityCheck)
                options.visibilityCheck = false;

            var builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

            return builder.getFunction();
        }
    };

    var context = createContext(sandbox);

    return runInContext(expression, context, { displayErrors: false });
}
