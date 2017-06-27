import { createContext, runInContext } from 'vm';
import SelectorBuilder from '../client-functions/selectors/selector-builder';

export function executeSelectorExpression (expression, skipVisibilityCheck) {
    var sandbox = {
        Selector: (fn, options) => {
            if (skipVisibilityCheck) {
                if (!options)
                    options = {};

                options.visibilityCheck = false;
            }

            var builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

            return builder.getCommand([]);
        }
    };

    var context = createContext(sandbox);

    return runInContext(expression, context, { displayErrors: false });
}
