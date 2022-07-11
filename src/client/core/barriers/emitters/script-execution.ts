import hammerhead from '../../deps/hammerhead';
import EventEmitter from '../../utils/event-emitter';
import { ScriptExecutionEmitter } from '../../../../shared/types';


const { nativeMethods } = hammerhead;

interface ScriptAddedEvent { el: HTMLScriptElement }
type ScriptEventListener = (script: HTMLScriptElement) => void;

const SCRIPT_ADDED            = 'script-added';
const SCRIPT_LOADED_OR_FAILED = 'script-loaded-or-failed';

export default class HammerheadScriptExecutionEmitter extends EventEmitter implements ScriptExecutionEmitter<HTMLScriptElement> {
    private readonly _scriptElementAddedListener: (e: ScriptAddedEvent) => void;

    public constructor () {
        super();

        this._scriptElementAddedListener = ({ el }: ScriptAddedEvent) => this._onScriptElementAdded(el);

        hammerhead.on(hammerhead.EVENTS.scriptElementAdded, this._scriptElementAddedListener);
    }

    private _onScriptElementAdded (script: HTMLScriptElement): void {
        const scriptSrc = nativeMethods.scriptSrcGetter.call(script);

        if (scriptSrc === void 0 || scriptSrc === '')
            return;

        this.emit(SCRIPT_ADDED, script);

        const done = (): void => {
            nativeMethods.removeEventListener.call(script, 'load', done);
            nativeMethods.removeEventListener.call(script, 'error', done);

            this.emit(SCRIPT_LOADED_OR_FAILED, script);
        };

        nativeMethods.addEventListener.call(script, 'load', done);
        nativeMethods.addEventListener.call(script, 'error', done);
    }

    public onScriptAdded (listener: ScriptEventListener): void {
        this.on(SCRIPT_ADDED, listener);
    }

    public onScriptLoadedOrFailed (listener: ScriptEventListener): void {
        this.on(SCRIPT_LOADED_OR_FAILED, listener);
    }

    public offAll (): void {
        super.offAll();
        hammerhead.off(hammerhead.EVENTS.scriptElementAdded, this._onScriptElementAdded);
    }
}
