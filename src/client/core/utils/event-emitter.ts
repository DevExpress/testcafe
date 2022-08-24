import { Dictionary } from '../../../configuration/interfaces';
// @ts-ignore
import { nativeMethods } from '../../driver/deps/hammerhead';


type Listener = (...args: any[]) => void;

export default class EventEmitter {
    private _eventsListeners: Dictionary<Listener[]>;

    public constructor () {
        this._eventsListeners = {};
    }

    public on (evt: string, listener: Listener): void {
        if (!this._eventsListeners[evt])
            this._eventsListeners[evt] = [];

        this._eventsListeners[evt].push(listener);
    }

    public once (evt: string, listener: Listener): void {
        this.on(evt, (...args) => {
            this.off(evt, listener);

            return listener(...args);
        });
    }

    public off (evt: string, listener: Listener): void {
        const listeners = this._eventsListeners[evt];

        if (listeners)
            this._eventsListeners[evt] = nativeMethods.arrayFilter.call(listeners, (item: Listener) => item !== listener);
    }

    public offAll (evt?: string): void {
        if (evt)
            this._eventsListeners[evt] = [];
        else
            this._eventsListeners = {};
    }

    public emit (evt: string, ...args: any): void {
        const listeners = this._eventsListeners[evt];

        if (!listeners)
            return;

        for (let i = 0; i < listeners.length; i++) {
            try {
                listeners[i].apply(this, args);
            }
            catch (e: any) {
                // Hack for IE: after document.write calling IFrameSandbox event handlers
                // rises 'Can't execute code from a freed script' exception because document has been
                // recreated
                if (e.message && e.message.indexOf('freed script') > -1)
                    this.off(evt, listeners[i]);
                else
                    throw e;
            }
        }
    }
}
