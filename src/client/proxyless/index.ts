/* eslint-disable no-restricted-globals */
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';
import { initializeAdapter } from '../driver/command-executors/client-functions/adapter/index';
import adapterInitializer from './adapter-initializer';


initializeAdapter(adapterInitializer);

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

