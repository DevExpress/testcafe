import ClientHybridFunction from '../hybrid-functions/client-function';
import SelectorHybridFunction from '../hybrid-functions/selector';

export default {
    Hybrid (fn, dependencies) {
        return new ClientHybridFunction(fn, dependencies, null, { instantiation: 'Hybrid' });
    },

    Selector (fn, dependencies) {
        return new SelectorHybridFunction(fn, dependencies, null, { instantiation: 'Selector' });
    }
};

