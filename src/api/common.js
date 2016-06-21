import ClientFunctionFactory from '../client-functions/client-function-factory';
import SelectorFactory from '../client-functions/selector-factory';

export default {
    ClientFunction (fn, scopeVars) {
        var factory = new ClientFunctionFactory(fn, scopeVars, { instantiation: 'ClientFunction' });

        return factory.getFunction();
    },

    Selector (fn, scopeVars) {
        var factory = new SelectorFactory(fn, scopeVars, { instantiation: 'Selector' });

        return factory.getFunction();
    }
};

