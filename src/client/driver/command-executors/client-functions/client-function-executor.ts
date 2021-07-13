import {
    createReplicator,
    FunctionTransform,
    ClientFunctionNodeTransform,
} from './replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientFunctionCode } from '../../../../shared/errors';
import Replicator from 'replicator';
import { ExecuteClientFunctionCommand, ExecuteClientFunctionCommandBase } from '../../../../test-run/commands/observation';
import { CommandExecutorsAdapterBase } from '../../../proxyless/command-executors-adapter-base';
import { Dictionary } from '../../../../configuration/interfaces';

export default class ClientFunctionExecutor<
    C extends ExecuteClientFunctionCommandBase = ExecuteClientFunctionCommand,
    D extends Dictionary<unknown> = Dictionary<unknown>> {

    protected readonly fn: Function;
    protected readonly replicator: Replicator;
    protected readonly dependencies: D;
    protected readonly command: C;
    protected readonly adapter: CommandExecutorsAdapterBase;

    public constructor (command: C, adapter: CommandExecutorsAdapterBase) {
        this.command      = command;
        this.adapter      = adapter;
        this.replicator   = this._createReplicator();
        this.dependencies = this.replicator.decode(command.dependencies) as D;

        this.fn = evalFunction(command.fnCode, this.dependencies, adapter);
    }

    public getResult (): Promise<unknown> {
        return this.adapter.getPromiseCtor().resolve()
            .then(() => {
                const args = this.replicator.decode(this.command.args) as unknown[];

                return this._executeFn(args);
            })
            .catch(err => {
                if (!err.isTestCafeError && !this.adapter.isProxyless())
                    err = new UncaughtErrorInClientFunctionCode(this.command.instantiationCallsiteName, err);

                throw err;
            });
    }

    public encodeResult (result: unknown): unknown {
        return this.replicator.encode(result);
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new ClientFunctionNodeTransform(this.command.instantiationCallsiteName, this.adapter),
            new FunctionTransform(this.adapter),
        ]);
    }

    protected _executeFn (args: unknown[]): unknown {
        return this.fn.apply(window, args);
    }
}
