import delay from '../../core/utils/delay';
import { ScriptExecutionEmitter, NativeMethods } from '../../../shared/types';
// @ts-ignore
import { nativeMethods, Promise } from '../deps/hammerhead';

type TimeoutLabel = ReturnType<NativeMethods['setTimeout']>;

const WAIT_FOR_NEW_SCRIPTS_DELAY = 25;

export default class ScriptExecutionBarrier<S> {
    private static readonly TIMEOUT = 3000;
    private static readonly LOADING_TIMEOUT = 2000;

    private readonly _emitter: ScriptExecutionEmitter<S>;
    private _waitResolve: (() => void) | null;
    private _watchdog: TimeoutLabel | null;
    private _scripts: Map<S, TimeoutLabel>;

    public constructor (emitter: ScriptExecutionEmitter<S>) {
        this._emitter     = emitter;
        this._watchdog    = null;
        this._waitResolve = null;
        this._scripts     = new Map();

        this._startListening();
    }

    private _startListening (): void {
        this._emitter.onScriptAdded((script: S) => this._onScriptElementAdded(script));
        this._emitter.onScriptLoadedOrFailed((script: S) => this._onScriptLoadedOrFailed(script));
    }

    private _offListening (): void {
        this._emitter.offAll();
    }

    private _onScriptElementAdded (script: S): void {
        const setTimeout     = nativeMethods.setTimeout;
        const timeoutFn      = (): void => this._onScriptLoadedOrFailed(script, true);
        const loadingTimeout = setTimeout(timeoutFn, ScriptExecutionBarrier.LOADING_TIMEOUT);

        this._scripts.set(script, loadingTimeout);
    }

    private _onScriptLoadedOrFailed (script: S, isTimeout = false): void {
        if (!this._scripts.has(script))
            return;

        if (!isTimeout) {
            const clearTimeout = nativeMethods.clearTimeout;

            clearTimeout(this._scripts.get(script) as TimeoutLabel);
        }

        this._scripts.delete(script);

        if (this._scripts.size)
            return;

        delay(WAIT_FOR_NEW_SCRIPTS_DELAY)
            .then(() => {
                if (this._waitResolve && !this._scripts.size)
                    this._finishWaiting();
            });
    }

    private _finishWaiting (): void {
        if (this._watchdog) {
            const clearTimeout = nativeMethods.clearTimeout;

            clearTimeout(this._watchdog);

            this._watchdog = null;
        }

        this._scripts.clear();
        this._offListening();
        this._waitResolve!(); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        this._waitResolve = null;
    }

    public wait (): Promise<void> {
        return new Promise((resolve: () => void) => {
            this._waitResolve = resolve;

            if (!this._scripts.size) {
                this._finishWaiting();

                return;
            }

            const setTimeout = nativeMethods.setTimeout;

            this._watchdog = setTimeout(() => this._finishWaiting(), ScriptExecutionBarrier.TIMEOUT);
        });
    }
}
