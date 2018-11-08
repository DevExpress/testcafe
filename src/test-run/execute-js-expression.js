import { createContext, runInContext } from 'vm';
import SelectorBuilder from '../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../client-functions/client-function-builder';

const contextsInfo = [];

function getContextInfo (testRun) {
    let contextInfo = contextsInfo.find(info => info.testRun === testRun);

    if (!contextInfo) {
        contextInfo = { testRun, context: createExecutionContext(testRun), options: {} };

        contextsInfo.push(contextInfo);
    }

    return contextInfo;
}

function getContext (testRun, options = {}) {
    const contextInfo = getContextInfo(testRun);

    contextInfo.options = options;

    return contextInfo.context;
}

function createExecutionContext (testRun) {
    const sandbox = {
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

export default function (expression, testRun, options) {
    const context = getContext(testRun, options);

    return runInContext(expression, context, { displayErrors: false });
}
