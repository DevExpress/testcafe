import createReplicator from './replicator/index';
import FunctionTransform from './replicator/transforms/function-transform';
import ClientFunctionNodeTransform from './replicator/transforms/client-function-node-transform';
import evalFunction from './eval-function';
import { UncaughtErrorInClientFunctionCode } from '../../../../shared/errors/index';
import Replicator from 'replicator';
import { ExecuteClientFunctionCommand, ExecuteClientFunctionCommandBase } from '../../../../test-run/commands/observation';
import { Dictionary } from '../../../../configuration/interfaces';
import adapter from './adapter/index';

export default class ClientFunctionExecutor<
    C extends ExecuteClientFunctionCommandBase = ExecuteClientFunctionCommand,
    D extends Dictionary<unknown> = Dictionary<unknown>> {

    protected readonly fn: Function;
    protected readonly replicator: Replicator;
    protected readonly dependencies: D;
    protected readonly command: C;

    public constructor (command: C) {
        this.command      = command;
        this.replicator   = this._createReplicator();
        this.dependencies = this.replicator.decode(command.dependencies) as D;

        this.fn = evalFunction(command.fnCode, this.dependencies);
    }

    public getResult (): Promise<unknown> {
        return adapter.PromiseCtor.resolve()
            .then(() => {
                const args = this.replicator.decode(this.command.args) as unknown[];

                return this._executeFn(args);
            })
            .catch(err => {
                if (!err.isTestCafeError && !adapter.isProxyless)
                    err = new UncaughtErrorInClientFunctionCode(this.command.instantiationCallsiteName, err);

                throw err;
            });
    }

    public encodeResult (result: unknown): unknown {
        return this.replicator.encode(result);
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new ClientFunctionNodeTransform(this.command.instantiationCallsiteName),
            new FunctionTransform(),
        ]);
    }

    protected _executeFn (args: unknown[]): unknown {
        return this.fn.apply(window, args);
    }
}
