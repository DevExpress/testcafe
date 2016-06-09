import HybridFunction from '../hybrid-function';
import SelectorHybridFunction from '../hybrid-function/selector';

export default {
    ClientFunction (fn, dependencies) {
        return new HybridFunction(fn, dependencies, null, { instantiation: 'ClientFunction' });
    },

    Selector (fn, dependencies) {
        return new SelectorHybridFunction(fn, dependencies, null, { instantiation: 'Selector' });
    }
};

