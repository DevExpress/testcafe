import ClientFunctionBuilder from '../client-functions/client-function-builder';
import SelectorBuilder from '../client-functions/selector-builder';

export default {
    ClientFunction (fn, options) {
        var builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    },

    Selector (fn, options) {
        var builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

        return builder.getFunction();
    }
};

