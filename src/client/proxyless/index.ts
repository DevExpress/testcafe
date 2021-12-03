/* eslint-disable no-restricted-globals */
// NOTE: Initializer should be the first
import './scroll-adapter-initializer';
import ClientFunctionExecutor from '../driver/command-executors/client-functions/client-function-executor';
import { ExecuteClientFunctionCommandBase, ExecuteSelectorCommand } from '../../test-run/commands/observation';
import { initializeAdapter as initializeClientFnAdapter } from '../driver/command-executors/client-functions/adapter/index';
import { initializeAdapter as initializeCoreUtilsAdapter } from '../core/utils/shared/adapter/index';
import clientFnAdapterInitializer from './client-fn-adapter-initializer';
import coreUtilsAdapterInitializer from './core-utils-adapter-initializer';
import SelectorExecutor from '../driver/command-executors/client-functions/selector-executor/index';
import { AutomationErrorCtors } from '../../shared/types';
import createErrorCtorCallback from '../../shared/errors/selector-error-ctor-callback';
import { ScrollOptions } from '../../test-run/commands/options';
import ScrollAutomation from '../core/scroll/index';
import { LeftTopValues } from '../../shared/utils/values/axis-values';


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
            returnNode: boolean, errCtors: AutomationErrorCtors) {

            const createNotFoundError    = command.needError ? createErrorCtorCallback(errCtors.notFound) : null;
            const createIsInvisibleError = command.needError ? createErrorCtorCallback(errCtors.invisible) : null;

            const selectorExecutor = new SelectorExecutor(command, selectorTimeout, startTime, createNotFoundError, createIsInvisibleError);

            return selectorExecutor.getResult()
                .then(result => returnNode ? result : JSON.stringify(selectorExecutor.encodeResult(result)));
        },

        scroll: function (el: Element, opts: ScrollOptions, margin?: LeftTopValues<number>) {
            const scrollAutomation = new ScrollAutomation(el, opts, margin);

            return scrollAutomation.run();
        },
    },

    configurable: true,
});

