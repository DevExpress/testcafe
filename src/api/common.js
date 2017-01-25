import ClientFunctionBuilder from '../client-functions/client-function-builder';
import SelectorBuilder from '../client-functions/selector-builder';
import testControllerProxy from './test-controller/proxy';
import ensureDeprecatedOptions from '../client-functions/selector-builder/ensure-deprecated-options';

export default {
    ClientFunction (fn, options) {
        var builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    },

    Selector (fn, options) {
        ensureDeprecatedOptions('Selector', options);

        var builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

        return builder.getFunction();
    },

    t: testControllerProxy
};

