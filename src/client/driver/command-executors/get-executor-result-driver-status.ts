import ClientFunctionExecutor from './client-functions/client-function-executor';
import DriverStatus from '../status';

export default function getExecutorResultDriverStatus (executor: ClientFunctionExecutor): Promise<DriverStatus> {
    return executor
        .getResult()
        .then((result: any) => new DriverStatus({
            isCommandResult: true,
            result:          executor.encodeResult(result),
        }))
        .catch((err: any) => new DriverStatus({
            isCommandResult: true,
            executionError:  err,
        }));
}
