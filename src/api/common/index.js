import createHybridFunction from './hybrid';

export default {
    Hybrid (fn, dependencies) {
        return createHybridFunction(fn, {
            dependencies:  dependencies,
            isSelector:    false,
            boundTestRun:  null,
            callsiteNames: { instantiation: 'Hybrid' }
        });
    },

    Selector (fn, dependencies) {
        return createHybridFunction(fn, {
            dependencies:  dependencies,
            isSelector:    true,
            boundTestRun:  null,
            callsiteNames: { instantiation: 'Selector' }
        });
    }
};

