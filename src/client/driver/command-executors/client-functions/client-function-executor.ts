import {
    createReplicator,
    FunctionTransform,
    ClientFunctionNodeTransform,
} from './replicator';
import evalFunction from './eval-function';
import { UncaughtErrorInClientFunctionCode } from '../../../../shared/errors';
import Replicator from 'replicator';
import { ExecuteClientFunctionCommandBase } from '../../../../test-run/commands/observation';
import { CommandExecutorsAdapterBase } from '../../../proxyless/command-executors-adapter-base';

export default class ClientFunctionExecutor {
    protected readonly fn: Function;
    protected readonly replicator: Replicator;
    protected readonly dependencies: unknown;
    protected readonly command: ExecuteClientFunctionCommandBase;
    private readonly _adapter: CommandExecutorsAdapterBase;

    public constructor (command: ExecuteClientFunctionCommandBase, adapter: CommandExecutorsAdapterBase) {
        this.command      = command;
        this._adapter     = adapter;
        this.replicator   = this._createReplicator();
        this.dependencies = this.replicator.decode(command.dependencies);

        this.fn = evalFunction(command.fnCode, this.dependencies, adapter);
    }

    public getResult (): Promise<unknown> {
        return this._adapter.getPromiseCtor().resolve()
            .then(() => {
                const args = this.replicator.decode(this.command.args) as unknown[];

                return this._executeFn(args);
            })
            .catch(err => {
                if (!err.isTestCafeError && !this._adapter.isProxyless())
                    err = new UncaughtErrorInClientFunctionCode(this.command.instantiationCallsiteName, err);

                throw err;
            });
    }

    public encodeResult (result: unknown): unknown {
        return this.replicator.encode(result);
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new ClientFunctionNodeTransform(this.command.instantiationCallsiteName, this._adapter),
            new FunctionTransform(this._adapter),
        ]);
    }

    protected _executeFn (args: unknown[]): unknown {
        return this.fn.apply(window, args);
    }
}
