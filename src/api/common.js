import ClientFunctionBuilder from '../client-functions/client-function-builder';
import SelectorBuilder from '../client-functions/selector-builder';

export default {
    ClientFunction (fn, scopeVars) {
        var builder = new ClientFunctionBuilder(fn, scopeVars, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    },

    Selector (fn, scopeVars) {
        var builder = new SelectorBuilder(fn, scopeVars, { instantiation: 'Selector' });

        return builder.getFunction();
    }
};

