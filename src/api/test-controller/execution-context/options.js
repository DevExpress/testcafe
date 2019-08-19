const OPTIONS_KEY = Symbol('options');

export default {
    get: context => context[OPTIONS_KEY],
    set: (context, options) => {
        context[OPTIONS_KEY] = options;
    }
};
