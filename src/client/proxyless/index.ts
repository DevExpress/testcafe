/* eslint-disable no-restricted-globals */
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase, ExecuteSelectorCommand } from '../../test-run/commands/observation';
import { initializeAdapter as initializeClientFnAdapter } from '../driver/command-executors/client-functions/adapter/index';
import { initializeAdapter as initializeCoreUtilsAdapter } from '../core/utils/adapter/index';
import clientFnAdapterInitializer from './client-fn-adapter-initializer';
import coreUtilsAdapterInitializer from './core-utils-adapter-initializer';
import * as Errors from '../../shared/errors/index';
import SelectorExecutor from '../driver/command-executors/client-functions/selector-executor/index';
import { FnInfo } from '../driver/command-executors/client-functions/types';


initializeClientFnAdapter(clientFnAdapterInitializer);
initializeCoreUtilsAdapter(coreUtilsAdapterInitializer);

Object.defineProperty(window, '%proxyless%', {
    value: {
        executeClientFunctionCommand: function (command: ExecuteClientFunctionCommandBase) {
            const executor = new ClientFunctionExecutor(command);

            return executor.getResult()
                .then(result => JSON.stringify(executor.encodeResult(result)));
        },

        executeSelectorCommand: function (command: ExecuteSelectorCommand, selectorTimeout: number, startTime: number,
            returnNode: boolean, errTypes: { notFound: string; invisible: string }) {

            const needError = typeof command.needError === 'boolean' ? command.needError : true;

            // @ts-ignore
            const createNotFoundError    = needError ? (fn: FnInfo | null) => new Errors[errTypes.notFound](null, fn) : null;
            // @ts-ignore
            const createIsInvisibleError = needError ? (fn: FnInfo | null) => new Errors[errTypes.invisible](null, fn) : null;

            const selectorExecutor = new SelectorExecutor(command, selectorTimeout, startTime, createNotFoundError, createIsInvisibleError);

            return selectorExecutor.getResult()
                .then(result => returnNode ? result : JSON.stringify(selectorExecutor.encodeResult(result)));
        },
    },

    configurable: true,
});

