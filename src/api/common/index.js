import Role from './role';
import createHybridFunction from './hybrid';

export default {
    Role,

    Hybrid (fn, dependencies) {
        return createHybridFunction(fn, dependencies);
    }
};

