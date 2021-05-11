import ClientFunctionExecutor from './client-function-executor';

Object.defineProperty(window, '%proxyless%', {
    value:        { ClientFunctionExecutor },
    configurable: true
});
