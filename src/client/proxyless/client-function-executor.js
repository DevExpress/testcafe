import {
    createReplicator,
    FunctionTransform,
    ClientFunctionNodeTransform
} from './replicator';
import evalFunction from './eval-function';

export default class ClientFunctionExecutor {
    constructor (command) {
        this.command      = command;
        this.replicator   = this._createReplicator();
        this.dependencies = this.replicator.decode(this.command.dependencies);

        this.fn = evalFunction(this.command.fnCode, this.dependencies);
    }

    getResult () {
        return Promise.resolve()
            .then(() => {
                const args = this.replicator.decode(this.command.args);

                return this._executeFn(args);
            })
            .then(result => this.replicator.encode(result));
    }

    //Overridable methods
    _createReplicator () {
        return createReplicator([
            new ClientFunctionNodeTransform(this.command.instantiationCallsiteName),
            new FunctionTransform()
        ]);
    }

    _executeFn (args) {
        return this.fn.apply(window, args);
    }
}
