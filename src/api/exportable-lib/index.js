import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import RoleDescriptor from './role-descriptor';
import testControllerProxy from '../test-controller/proxy';

export default {
    ClientFunction (fn, options) {
        var builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

        return builder.getFunction();
    },

    Selector (fn, options) {
        var builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

        return builder.getFunction();
    },

    Role (loginPage, initFn) {
        return new RoleDescriptor(loginPage, initFn);
    },

    t: testControllerProxy
};

