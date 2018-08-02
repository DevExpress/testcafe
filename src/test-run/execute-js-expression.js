import { createContext, runInContext } from 'vm';
import SelectorBuilder from '../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../client-functions/client-function-builder';

var contextsInfo = [];

function getContextInfo (testRun) {
    var contextInfo = contextsInfo.find(info => info.testRun === testRun);

    if (!contextInfo) {
        contextInfo = { testRun, context: createExecutionContext(testRun), options: {} };

        contextsInfo.push(contextInfo);
    }

    return contextInfo;
}

function getContext (testRun, options = {}) {
    var contextInfo = getContextInfo(testRun);

    contextInfo.options = options;

    return contextInfo.context;
}

function createExecutionContext (testRun) {
    var sandbox = {
        Selector: (fn, options = {}) => {
            const { skipVisibilityCheck, collectionMode } = getContextInfo(testRun).options;

            if (skipVisibilityCheck)
                options.visibilityCheck = false;

            if (testRun && testRun.id)
                options.boundTestRun = testRun;

            if (collectionMode)
                options.collectionMode = collectionMode;

            const builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

            return builder.getFunction();
        },

        ClientFunction: (fn, options = {}) => {
            if (testRun && testRun.id)
                options.boundTestRun = testRun;

            const builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

            return builder.getFunction();
        }
    };

    return createContext(sandbox);
}

export function executeJsExpression (expression, testRun, skipVisibilityCheck, collectionMode) {
    const context = getContext(testRun, { skipVisibilityCheck, collectionMode });

    return runInContext(expression, context, { displayErrors: false });
}
