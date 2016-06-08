import HybridFunction from '../hybrid-function';
import SelectorHybridFunction from '../hybrid-function/selector';

export default {
    Hybrid (fn, dependencies) {
        return new HybridFunction(fn, dependencies, null, { instantiation: 'Hybrid' });
    },

    Selector (fn, dependencies) {
        return new SelectorHybridFunction(fn, dependencies, null, { instantiation: 'Selector' });
    }
};

