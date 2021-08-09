/* eslint-disable no-restricted-globals */
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';
import { initializeAdapter as initializeClientFnAdapter } from '../driver/command-executors/client-functions/adapter/index';
import { initializeAdapter as initializeCoreUtilsAdapter } from '../core/utils/adapter/index';
import clientFnAdapterInitializer from './client-fn-adapter-initializer';
import coreUtilsAdapterInitializer from './core-utils-adapter-initializer';


initializeClientFnAdapter(clientFnAdapterInitializer);
initializeCoreUtilsAdapter(coreUtilsAdapterInitializer);

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

