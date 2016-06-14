import ClientFunctionExecutor from './client-function-executor';
import SelectorExecutor from './selector-executor';

export default function executeClientFunction (command, elementAvailabilityTimeout) {
    var executor = command.isSelector ?
                   new SelectorExecutor(command, elementAvailabilityTimeout) :
                   new ClientFunctionExecutor(command);

    return executor.getResultDriverStatus();
}
