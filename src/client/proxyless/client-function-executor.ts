import {
    createReplicator,
    FunctionTransform,
    ClientFunctionNodeTransform
} from './replicator';
import evalFunction from './eval-function';
import Replicator from 'replicator';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';

export default class ClientFunctionExecutor {
    public readonly fn: Function;
    public readonly replicator: Replicator;
    public readonly dependencies: unknown;
    public readonly command: ExecuteClientFunctionCommandBase

    public constructor (command: ExecuteClientFunctionCommandBase) {
        this.command      = command;
        this.replicator   = this._createReplicator();
        this.dependencies = this.replicator.decode(this.command.dependencies);

        this.fn = evalFunction(this.command.fnCode, this.dependencies);
    }

    public getResult (): Promise<unknown> {
        // eslint-disable-next-line hammerhead/use-hh-promise
        return Promise.resolve()
            .then(() => {
                const args = this.replicator.decode(this.command.args) as any[];

                return this._executeFn(args);
            })
            .then(result => this.replicator.encode(result));
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new ClientFunctionNodeTransform(this.command.instantiationCallsiteName),
            new FunctionTransform()
        ]);
    }

    protected _executeFn (args: any[]): unknown {
        return this.fn.apply(window, args);
    }
}
