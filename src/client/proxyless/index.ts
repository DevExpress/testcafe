/* eslint-disable no-restricted-globals */
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';
import adapter from '../driver/command-executors/client-functions/adapter/index';
import initializeAdapter from './adapter-initializer';


initializeAdapter(adapter);

Object.defineProperty(window, '%proxyless%', {
    value: {
        executeClientFunctionCommand: function (command: ExecuteClientFunctionCommandBase) {
            const executor = new ClientFunctionExecutor(command);

            return executor.getResult()
                .then(result => JSON.stringify(executor.encodeResult(result)));
        },
    },

    configurable: true,
});

