import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import { createRole, createAnonymousRole } from '../../role';
import testControllerProxy from '../test-controller/proxy';
import createRequestLogger from '../request-hooks/request-logger';
import createRequestMock from '../request-hooks/request-mock';
import RequestHook from '../request-hooks/hook';

function Role (loginPage, initFn, options) {
    return createRole(loginPage, initFn, options);
}

function RequestMock () {
    return createRequestMock();
}

function RequestLogger (requestFilterRuleInit, logOptions) {
    return createRequestLogger(requestFilterRuleInit, logOptions);
}

function ClientFunction (fn, options) {
    const builder = new ClientFunctionBuilder(fn, options, { instantiation: 'ClientFunction' });

    return builder.getFunction();
}

function Selector (fn, options) {
    const builder = new SelectorBuilder(fn, options, { instantiation: 'Selector' });

    return builder.getFunction();
}

Role.anonymous = createAnonymousRole;

export default {
    Role,

    ClientFunction,

    Selector,

    RequestLogger,

    RequestMock,

    RequestHook,

    t: testControllerProxy
};
