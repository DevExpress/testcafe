import { adapter } from '../adapter/index';
import RequestBarrier from './request';
import ScriptExecutionBarrier from './script-execution';
import { ClientRequestEmitter, ScriptExecutionEmitter } from '../types';


interface PageUnloadBarrier {
    watchForPageNavigationTriggers?: () => void;
    wait: () => Promise<void>;
}

export default class BarriersComplex<R, S> {
    private readonly _requestBarrier: RequestBarrier<R>;
    private readonly _scriptExecutionBarrier: ScriptExecutionBarrier<S>;
    private readonly _unloadBarrier: PageUnloadBarrier;

    public constructor (reqEmitter: ClientRequestEmitter<R>, scriptEmitter: ScriptExecutionEmitter<S>, unloadBarrier: PageUnloadBarrier) {
        this._requestBarrier         = new RequestBarrier(reqEmitter);
        this._scriptExecutionBarrier = new ScriptExecutionBarrier(scriptEmitter);
        this._unloadBarrier          = unloadBarrier;

        if (unloadBarrier.watchForPageNavigationTriggers)
            unloadBarrier.watchForPageNavigationTriggers();
    }

    public wait (): Promise<void> {
        return adapter.PromiseCtor.all([
            // NOTE: script can be added by xhr-request, so we should run
            // script execution barrier waiting after request barrier resolved
            this._requestBarrier.wait()
                .then(() => this._scriptExecutionBarrier.wait()),

            this._unloadBarrier.wait(),
        ]).then();
    }
}
