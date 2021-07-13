/* eslint-disable no-restricted-globals */
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';
import CommandExecutorsAdapter from './command-executors-adapter';


Object.defineProperty(window, '%proxyless%', {
    value: {
        adapter: new CommandExecutorsAdapter(),

        executeClientFunctionCommand: function (command: ExecuteClientFunctionCommandBase) {
            const executor = new ClientFunctionExecutor(command, this.adapter);

            return executor.getResult()
                .then(result => JSON.stringify(executor.encodeResult(result)));
        },
    },

    configurable: true,
});

