import ClientFunctionFactory from '../client-functions/client-function-factory';
import SelectorFactory from '../client-functions/selector-factory';

export default {
    ClientFunction (fn, dependencies) {
        var factory = new ClientFunctionFactory(fn, dependencies, { instantiation: 'ClientFunction' });

        return factory.getFunction();
    },

    Selector (fn, dependencies) {
        var factory = new SelectorFactory(fn, dependencies, { instantiation: 'Selector' });

        return factory.getFunction();
    }
};

