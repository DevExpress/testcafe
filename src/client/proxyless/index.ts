import ClientFunctionExecutor from './client-function-executor';

// eslint-disable-next-line no-restricted-globals
Object.defineProperty(window, '%proxyless%', {
    value:        { ClientFunctionExecutor },
    configurable: true
});

