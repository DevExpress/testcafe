import ClientFunctionFactory from '../client-functions/client-function-factory';
import SelectorFactory from '../client-functions/selector-factory';

export default {
    ClientFunction (fn, env) {
        var factory = new ClientFunctionFactory(fn, env, { instantiation: 'ClientFunction' });

        return factory.getFunction();
    },

    Selector (fn, env) {
        var factory = new SelectorFactory(fn, env, { instantiation: 'Selector' });

        return factory.getFunction();
    }
};

